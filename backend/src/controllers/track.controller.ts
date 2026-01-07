import { Request, Response } from 'express';
import Order from '../models/Order.model';
import { NotFoundError, ValidationError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Track order by order number and email (public endpoint)
 * @route GET /api/track/:orderNumber
 * @access Public
 */
export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const { email } = req.query;

  // Validate inputs
  if (!orderNumber || !email) {
    throw new ValidationError('Order number and email are required');
  }

  // Find order by order number
  const order = await Order.findOne({ orderNumber })
    .populate('user', 'name email')
    .populate('items.product', 'name thumbnail price')
    .lean(); // Use lean() for better performance and simpler object

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Verify email matches (case-insensitive)
  const orderUser = order.user as any;
  if (orderUser.email.toLowerCase() !== (email as string).toLowerCase()) {
    throw new ValidationError('Email does not match order records');
  }

  // Prepare tracking information
  const trackingInfo = {
    orderNumber: order.orderNumber,
    status: order.orderStatus, // Use orderStatus from model
    paymentStatus: order.paymentStatus,
    shippingMethod: order.shippingMethod || 'standard', // Include shipping method
    createdAt: order.createdAt,
    estimatedDelivery: calculateEstimatedDelivery(order),
    timeline: generateTimeline(order),
    shippingAddress: order.shippingAddress,
    items: order.items.map((item: any) => ({
      product: {
        name: item.product.name,
        thumbnail: item.product.thumbnail,
        price: item.product.price,
      },
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.totalAmount, // Use totalAmount from model
  };

  res.status(200).json({
    success: true,
    data: trackingInfo,
  });
});

/**
 * Calculate estimated delivery date based on order status and creation date
 */
function calculateEstimatedDelivery(order: any): string {
  const createdDate = new Date(order.createdAt);
  let daysToAdd = 7; // Default 7 days

  // Adjust based on shipping method if available
  if (order.shippingMethod === 'express') {
    daysToAdd = 3;
  } else if (order.shippingMethod === 'standard') {
    daysToAdd = 7;
  }

  // If already delivered, return actual delivery date
  if (order.orderStatus === 'delivered' && order.deliveredAt) {
    return new Date(order.deliveredAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Calculate estimated date
  const estimatedDate = new Date(createdDate);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

  return estimatedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generate timeline based on order status and timestamps
 */
function generateTimeline(order: any) {
  const timeline = [];

  // Order Confirmed
  timeline.push({
    status: 'confirmed',
    title: 'Order Confirmed',
    description: 'Your order has been received and confirmed',
    date: order.createdAt,
    completed: true,
  });

  // Processing
  const processingCompleted = ['processing', 'shipped', 'delivered', 'cancelled'].includes(order.orderStatus);
  timeline.push({
    status: 'processing',
    title: 'Processing',
    description: 'Your order is being prepared',
    date: processingCompleted ? order.createdAt : null,
    completed: processingCompleted,
  });

  // Shipped
  const shippedCompleted = ['shipped', 'delivered'].includes(order.orderStatus);
  timeline.push({
    status: 'shipped',
    title: 'Shipped',
    description: 'Your order has been shipped',
    date: shippedCompleted ? (order.shippedAt || order.createdAt) : null,
    completed: shippedCompleted,
  });

  // Out for Delivery (optional step before delivered)
  const outForDeliveryCompleted = order.orderStatus === 'delivered';
  timeline.push({
    status: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Your order is out for delivery',
    date: outForDeliveryCompleted ? (order.outForDeliveryAt || order.createdAt) : null,
    completed: outForDeliveryCompleted,
  });

  // Delivered
  const deliveredCompleted = order.orderStatus === 'delivered';
  timeline.push({
    status: 'delivered',
    title: 'Delivered',
    description: deliveredCompleted ? 'Your order has been delivered' : 'Estimated delivery',
    date: deliveredCompleted ? (order.deliveredAt || order.createdAt) : calculateEstimatedDelivery(order),
    completed: deliveredCompleted,
  });

  return timeline;
}
