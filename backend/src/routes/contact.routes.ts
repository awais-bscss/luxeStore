import { Router } from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  getContactMessage,
  updateMessageStatus,
  deleteContactMessage,
} from '../controllers/contact.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public route - anyone can submit a contact message
router.post('/', submitContactMessage);

// Admin routes - protected
router.get('/', protect, authorize('admin', 'superadmin'), getAllContactMessages);
router.get('/:id', protect, authorize('admin', 'superadmin'), getContactMessage);
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'superadmin'),
  updateMessageStatus
);
router.delete(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  deleteContactMessage
);

export default router;
