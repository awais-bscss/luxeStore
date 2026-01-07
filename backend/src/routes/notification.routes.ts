import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
  createNotification,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';

const router = Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Clear all read notifications
router.delete('/clear-all', clearAllRead);

// Create notification (Admin/SuperAdmin only)
router.post('/create', requireRole('admin', 'superadmin'), createNotification);

export default router;
