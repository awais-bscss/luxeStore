import { Router } from 'express';
import { updateProfile, getProfile, getCustomers, changePassword } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin only routes - allow both admin and superadmin
router.get('/customers', protect, authorize('admin', 'superadmin'), getCustomers);

export default router;

