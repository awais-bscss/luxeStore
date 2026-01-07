import Order from '../models/Order.model';
import Cart from '../models/Cart.model';
import User from '../models/User.model';
import Product from '../models/Product.model';
import SystemSettings from '../models/SystemSettings.model';
import { NotFoundError, ValidationError } from '../utils/errors';
import notificationService from './notification.service';

interface CreateOrderData {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'cod' | 'card' | 'paypal';
  shippingMethod?: 'standard' | 'express'; // Added for express shipping
  notes?: string;
  paymentIntentId?: string; // Added for card payments
}

class OrderService {
  async createOrder(userId: string, orderData: CreateOrderData) {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Validate stock availability for all items BEFORE creating order
    for (const item of cart.items) {
      const productId = (item.product as any)._id || item.product;
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError(`Product not found`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate totals using CURRENT settings from database
    // This ensures orders always use the latest prices, even if admin changed them
    const settings = await SystemSettings.findOne();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate shipping cost based on current settings
    const freeShippingThreshold = settings?.freeShippingThreshold || 50;
    const standardShippingCost = settings?.standardShippingCost || 5.99;
    const expressShippingCost = settings?.expressShippingCost || 12.99;

    let shippingCost = 0;
    if (subtotal >= freeShippingThreshold) {
      shippingCost = 0; // Free shipping
    } else if (orderData.shippingMethod === 'express') {
      shippingCost = expressShippingCost;
    } else {
      shippingCost = standardShippingCost; // Default to standard
    }

    // Calculate tax based on current settings
    const taxRate = settings?.taxRate || 10;
    const includeTaxInPrices = settings?.includeTaxInPrices || false;
    const tax = includeTaxInPrices ? 0 : subtotal * (taxRate / 100);

    const totalAmount = subtotal + shippingCost + tax;

    // ✅ SECURITY: Verify payment for card payments
    if (orderData.paymentMethod === 'card') {
      // Card payment requires paymentIntentId
      if (!orderData.paymentIntentId) {
        throw new ValidationError(
          'Payment intent ID is required for card payments. Please complete payment first.'
        );
      }

      // Verify payment with Stripe
      const stripeService = (await import('./stripe.service')).default;
      const paymentDetails = await stripeService.verifyPaymentIntent(
        orderData.paymentIntentId
      );

      // Check if payment was successful
      if (paymentDetails.status !== 'succeeded') {
        throw new ValidationError(
          `Payment ${paymentDetails.status}. Please complete payment before placing order.`
        );
      }

      // Verify payment amount matches order total (prevent tampering)
      // Stripe stores amount in smallest currency unit (paisa for PKR, cents for USD)
      const paidAmountInPaisa = paymentDetails.amount; // Amount in paisa
      const paidAmount = paidAmountInPaisa / 100; // Convert paisa to PKR
      const expectedAmount = Math.round(totalAmount * 100) / 100; // Round to 2 decimals

      // Allow small rounding differences (within 1 PKR)
      if (Math.abs(paidAmount - expectedAmount) > 1) {
        throw new ValidationError(
          `Payment amount mismatch. Expected: Rs ${expectedAmount.toFixed(2)}, Paid: Rs ${paidAmount.toFixed(2)}`
        );
      }

      console.log('✅ Payment verified:', {
        paymentIntentId: orderData.paymentIntentId,
        amountPaid: `Rs ${paidAmount.toFixed(2)}`,
        amountExpected: `Rs ${expectedAmount.toFixed(2)}`,
        status: paymentDetails.status,
      });
    }

    // Prepare order items
    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      thumbnail: item.product.thumbnail,
    }));

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentIntentId: orderData.paymentIntentId, // Store payment intent ID
      paymentStatus: orderData.paymentMethod === 'card' ? 'paid' : 'pending', // Card payments are already paid
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes: orderData.notes,
    });

    // Reduce stock for each product
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock -= item.quantity;
        await product.save();

        const settings = await SystemSettings.findOne();

        // Send out-of-stock notification (highest priority)
        if (product.stock === 0) {
          await notificationService.notifyAdmins({
            type: 'product',
            title: '🚨 Product Out of Stock',
            message: `${product.name} is now completely out of stock!`,
            link: '/admin/products',
            priority: 'high',
            metadata: { productId: product._id.toString(), stock: 0 },
          });
          console.log(`🚨 OUT OF STOCK notification sent for ${product.name}`);
        }
        // Send low stock notification
        else if (settings?.lowStockAlerts && product.stock < 10 && product.stock > 0) {
          await notificationService.notifyLowStock(
            product._id.toString(),
            product.name,
            product.stock
          );
          console.log(`⚠️ LOW STOCK notification sent for ${product.name} (${product.stock} left)`);
        }
      }
    }

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: { totalOrders: 1, totalSpent: totalAmount },
      lastOrder: new Date(),
    });

    // Send order notification to admins if enabled
    try {
      const settings = await SystemSettings.findOne();
      const user = await User.findById(userId);

      if (settings?.orderNotifications && user) {
        await notificationService.notifyNewOrder(
          order._id.toString(),
          order.orderNumber || order._id.toString().slice(-6),
          user.name,
          totalAmount
        );
      }
    } catch (error) {
      console.error('Failed to send order notification:', error);
      // Don't throw - order creation should succeed even if notification fails
    }

    // Clear cart after order is created
    cart.items = [];
    await cart.save();

    return await order.populate('user', 'name email');
  }

  async getAllOrders(
    filters?: {
      status?: string;
      paymentStatus?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ) {
    const query: any = {};

    if (filters?.status) {
      query.orderStatus = filters.status;
    }

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count
    const totalOrders = await Order.countDocuments(query);

    // Get paginated orders
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate statistics from ALL orders (not just current page)
    const allOrders = await Order.find(query);
    const totalRevenue = allOrders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending').length;
    const deliveredOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      statistics: {
        totalRevenue,
        pendingOrders,
        deliveredOrders,
      },
    };
  }

  async getUserOrders(userId: string) {
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name thumbnail')
      .sort({ createdAt: -1 });

    return orders;
  }

  async getOrderById(orderId: string) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name thumbnail');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // IMPORTANT: Prevent reactivating cancelled orders
    if (order.orderStatus === 'cancelled' && status !== 'cancelled') {
      throw new ValidationError(
        'Cannot reactivate a cancelled order. Please ask the customer to place a NEW order instead. ' +
        'This ensures proper payment authorization, inventory reservation, and transaction tracking.'
      );
    }

    // If changing to cancelled status, restore stock
    if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
      console.log(`🔄 Admin cancelling order ${orderId} - restoring stock...`);

      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          console.log(`✅ Restored ${item.quantity} units of ${product.name} to stock`);
        }
      }
    }

    order.orderStatus = status;

    // If order is delivered, mark payment as paid (for COD)
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    return await order.populate('user', 'name email');
  }

  async updatePaymentStatus(
    orderId: string,
    status: 'pending' | 'paid' | 'failed'
  ) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.paymentStatus = status;
    await order.save();

    return await order.populate('user', 'name email');
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== userId) {
      throw new ValidationError('You can only cancel your own orders');
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      throw new ValidationError(
        `Cannot cancel order with status: ${order.orderStatus}`
      );
    }

    // Restore stock for each product
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
        console.log(`✅ Restored ${item.quantity} units of ${product.name} to stock`);
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return order;
  }

  async getOrderStats() {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  async archiveOrder(orderId: string, userId: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== userId) {
      throw new ValidationError('You can only archive your own orders');
    }

    order.isArchived = true;
    await order.save();

    return order;
  }

  async unarchiveOrder(orderId: string, userId: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== userId) {
      throw new ValidationError('You can only unarchive your own orders');
    }

    order.isArchived = false;
    await order.save();

    return order;
  }
}

export default new OrderService();
