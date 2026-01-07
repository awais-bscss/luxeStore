import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import Notification from '../models/Notification.model';
import { ValidationError, NotFoundError } from '../utils/errors';
import mongoose from 'mongoose';

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 */
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const query: any = { userId: req.user._id };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  }
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: { notification },
      message: 'Notification marked as read',
    });
  }
);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'All notifications marked as read',
    });
  }
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  }
);

/**
 * @route   DELETE /api/notifications/clear-all
 * @desc    Delete all read notifications
 * @access  Private
 */
export const clearAllRead = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const result = await Notification.deleteMany({
      userId: req.user._id,
      read: true,
    });

    res.status(200).json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: 'All read notifications cleared',
    });
  }
);

/**
 * @route   POST /api/notifications/create
 * @desc    Create a notification (Admin/System use)
 * @access  Private (Admin/SuperAdmin)
 */
export const createNotification = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId, type, title, message, link, priority, metadata } = req.body;

    if (!userId || !type || !title || !message) {
      throw new ValidationError('Missing required fields');
    }

    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      message,
      link,
      priority: priority || 'medium',
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      data: { notification },
      message: 'Notification created',
    });
  }
);
