import mongoose from 'mongoose';
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);

      if (!cart || cart.items.length === 0) {
        throw new ValidationError('Cart is empty');
      }

      // 1. Calculate totals and validate stock (Atomic Check)
      // This ensures orders always use the latest prices, even if admin changed them
      const settings = await SystemSettings.findOne().session(session);

      // Business Logic: Handle Currency Conversion for Settings
      const rate = settings?.usdToPkrRate || 280;
      const isUSD = settings?.currency === 'USD';
      const thresholdPKR = isUSD ? (settings?.freeShippingThreshold || 50) * rate : (settings?.freeShippingThreshold || 50);
      const standardShippingPKR = isUSD ? (settings?.standardShippingCost || 5.99) * rate : (settings?.standardShippingCost || 5.99);
      const expressShippingPKR = isUSD ? (settings?.expressShippingCost || 12.99) * rate : (settings?.expressShippingCost || 12.99);

      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      let shippingCost = 0;
      if (subtotal >= thresholdPKR) {
        shippingCost = 0;
      } else if (orderData.shippingMethod === 'express') {
        shippingCost = expressShippingPKR;
      } else {
        shippingCost = standardShippingPKR;
      }

      const taxRate = settings?.taxRate || 10;
      const includeTaxInPrices = settings?.includeTaxInPrices || false;
      const tax = includeTaxInPrices ? 0 : subtotal * (taxRate / 100);
      const totalAmount = subtotal + shippingCost + tax;

      // 2. Reduce stock for each product ATOMICALLY
      // We do this BEFORE creating the order to ensure we actually have the items
      for (const item of cart.items) {
        const productId = (item.product as any)._id || item.product;
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!updatedProduct) {
          const product = await Product.findById(productId).session(session);
          throw new ValidationError(
            `Insufficient stock for ${product?.name || 'product'}. Requested: ${item.quantity}, Available: ${product?.stock || 0}`
          );
        }

        // Notification triggers (Don't need to be in session but we handle them after loop)
        if (updatedProduct.stock === 0) {
          // Trigger OOS notification (async/non-blocking)
          notificationService.notifyAdmins({
            type: 'product',
            title: '🚨 Product Out of Stock',
            message: `${updatedProduct.name} is now completely out of stock!`,
            link: '/admin/products',
            priority: 'high',
            metadata: { productId: updatedProduct._id.toString(), stock: 0 },
          }).catch(err => console.error('OOS Notification Failed:', err));
        } else if (settings?.lowStockAlerts && updatedProduct.stock < 10) {
          notificationService.notifyLowStock(
            updatedProduct._id.toString(),
            updatedProduct.name,
            updatedProduct.stock
          ).catch(err => console.error('Low Stock Notification Failed:', err));
        }
      }

      // 3. SECURE PAYMENT VERIFICATION
      if (orderData.paymentMethod === 'card') {
        if (!orderData.paymentIntentId) {
          throw new ValidationError('Payment intent ID is required for card payments.');
        }

        const stripeService = (await import('./stripe.service')).default;
        const paymentDetails = await stripeService.verifyPaymentIntent(orderData.paymentIntentId);

        if (paymentDetails.status !== 'succeeded') {
          throw new ValidationError(`Payment ${paymentDetails.status}. Please complete payment before placing order.`);
        }

        const paidAmount = paymentDetails.amount / 100;
        const expectedAmount = Math.round(totalAmount * 100) / 100;

        if (Math.abs(paidAmount - expectedAmount) > 1) {
          throw new ValidationError(`Payment amount mismatch. Expected: Rs ${expectedAmount.toFixed(2)}, Paid: Rs ${paidAmount.toFixed(2)}`);
        }
      }

      // 4. Create Order Record
      const orderItems = cart.items.map((item: any) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        thumbnail: item.product.thumbnail,
      }));

      const [order] = await Order.create([{
        user: userId,
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentIntentId: orderData.paymentIntentId,
        paymentStatus: orderData.paymentMethod === 'card' ? 'paid' : 'pending',
        subtotal,
        shippingCost,
        tax,
        totalAmount,
        notes: orderData.notes,
      }], { session });

      // 5. Update User Statistics
      await User.findByIdAndUpdate(userId, {
        $inc: { totalOrders: 1, totalSpent: totalAmount },
        lastOrder: new Date(),
      }, { session });

      // 6. Clear Cart
      cart.items = [];
      await cart.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      // Post-order processing (Non-critical notifications)
      this.sendPostOrderNotifications(order, userId, totalAmount, settings).catch(err =>
        console.error('Post-order notifications failed:', err)
      );

      return await order.populate('user', 'name email');
    } catch (error) {
      // Abort transaction on any failure
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Helper for non-critical post-order tasks
   */
  private async sendPostOrderNotifications(order: any, userId: string, totalAmount: number, settings: any) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      if (settings?.orderNotifications) {
        await notificationService.notifyNewOrder(
          order._id.toString(),
          order.orderNumber || order._id.toString().slice(-6),
          user.name,
          totalAmount
        );
      }

      if (order.paymentMethod === 'card' && settings?.emailNotifications) {
        const emailService = (await import('./email.service')).default;
        await emailService.sendPaymentSuccessEmail(
          user.email,
          user.name,
          order.orderNumber || order._id.toString().slice(-6),
          totalAmount,
          settings?.currency || 'PKR'
        );
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
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
