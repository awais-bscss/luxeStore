import Notification from '../models/Notification.model';
import User from '../models/User.model';
import SystemSettings from '../models/SystemSettings.model';
import mongoose from 'mongoose';

class NotificationService {
  /**
   * Get currency symbol from system settings
   */
  private async getCurrencySymbol(): Promise<string> {
    try {
      const settings = await SystemSettings.findOne();
      const currency = settings?.currency || 'USD';

      const currencySymbols: Record<string, string> = {
        'USD': '$',
        'PKR': 'Rs',
        'EUR': '€',
        'GBP': '£',
      };

      return currencySymbols[currency] || '$';
    } catch (error) {
      return '$'; // Fallback
    }
  }

  /**
   * Format amount with currency
   */
  private async formatCurrency(amount: number): Promise<string> {
    const symbol = await this.getCurrencySymbol();
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Create a notification for a specific user
   */
  async createNotification(data: {
    userId: string | mongoose.Types.ObjectId;
    type: 'order' | 'product' | 'review' | 'customer' | 'system' | 'security';
    title: string;
    message: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    try {
      const notification = await Notification.create({
        userId: typeof data.userId === 'string' ? new mongoose.Types.ObjectId(data.userId) : data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        priority: data.priority || 'medium',
        metadata: data.metadata || {},
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify all admins and superadmins
   */
  async notifyAdmins(data: {
    type: 'order' | 'product' | 'review' | 'customer' | 'system' | 'security';
    title: string;
    message: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    try {
      const admins = await User.find({
        role: { $in: ['admin', 'superadmin'] },
      }).select('_id');

      const notifications = admins.map((admin) => ({
        userId: admin._id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        priority: data.priority || 'medium',
        metadata: data.metadata || {},
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error notifying admins:', error);
      throw error;
    }
  }

  /**
   * Notify only superadmins
   */
  async notifySuperAdmins(data: {
    type: 'order' | 'product' | 'review' | 'customer' | 'system' | 'security';
    title: string;
    message: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    try {
      const superAdmins = await User.find({
        role: 'superadmin',
      }).select('_id');

      const notifications = superAdmins.map((admin) => ({
        userId: admin._id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        priority: data.priority || 'medium',
        metadata: data.metadata || {},
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error notifying superadmins:', error);
      throw error;
    }
  }

  /**
   * Notify about new order
   */
  async notifyNewOrder(orderId: string, orderNumber: string, customerName: string, totalAmount: number) {
    const formattedAmount = await this.formatCurrency(totalAmount);
    return this.notifyAdmins({
      type: 'order',
      title: '🛒 New Order Received',
      message: `Order #${orderNumber} from ${customerName} - ${formattedAmount}`,
      link: `/admin/orders`,
      priority: 'medium',
      metadata: { orderId, orderNumber },
    });
  }

  /**
   * Notify about low stock
   */
  async notifyLowStock(productId: string, productName: string, currentStock: number) {
    return this.notifyAdmins({
      type: 'product',
      title: '⚠️ Low Stock Alert',
      message: `${productName} is running low (${currentStock} left)`,
      link: `/admin/products`,
      priority: 'high',
      metadata: { productId, currentStock },
    });
  }

  /**
   * Notify about new review
   */
  async notifyNewReview(reviewId: string, productName: string, rating: number, userName: string) {
    return this.notifyAdmins({
      type: 'review',
      title: '⭐ New Review',
      message: `${userName} left a ${rating}-star review on ${productName}`,
      link: `/admin/reviews`,
      priority: 'low',
      metadata: { reviewId, rating },
    });
  }

  /**
   * Notify about new customer signup
   */
  async notifyNewCustomer(customerId: string, customerName: string, customerEmail: string) {
    return this.notifyAdmins({
      type: 'customer',
      title: '👤 New Customer',
      message: `${customerName} (${customerEmail}) just signed up`,
      link: `/admin/customers`,
      priority: 'low',
      metadata: { customerId },
    });
  }

  /**
   * Notify about system events
   */
  async notifySystemEvent(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.notifySuperAdmins({
      type: 'system',
      title,
      message,
      link: '/admin/settings',
      priority,
    });
  }

  /**
   * Notify about security events
   */
  async notifySecurityEvent(title: string, message: string, metadata?: any) {
    return this.notifySuperAdmins({
      type: 'security',
      title,
      message,
      link: '/admin/settings',
      priority: 'high',
      metadata,
    });
  }
}

export default new NotificationService();
