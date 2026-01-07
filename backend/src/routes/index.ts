import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import favoriteRoutes from './favorite.routes';
import orderRoutes from './order.routes';
import customerRoutes from './customer.routes';
import analyticsRoutes from './analytics.routes';
import settingsRoutes from './settings.routes';
import rbacTestRoutes from './rbac.test.routes';
import reviewRoutes from './review.routes';
import uploadRoutes from './upload.routes';
import contactRoutes from './contact.routes';
import userRoutes from './user.routes';
import debugRoutes from './debug.routes';
import twoFactorRoutes from './twoFactor.routes';
import emailVerificationRoutes from './emailVerification.routes';
import emailRoutes from './email.routes';
import notificationRoutes from './notification.routes';
import stripeRoutes from './stripe.routes';
import trackRoutes from './track.routes';
import jobRoutes from './job.routes';
import blogRoutes from './blog.routes';
import { downloadResume } from '../controllers/download.controller';
import { migrateResumes } from '../controllers/migration.controller';
import { debugApplications } from '../controllers/debug-applications.controller';
import { protect, authorize } from '../middleware/auth';


const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/auth', emailVerificationRoutes); // Email verification under /auth
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/rbac', rbacTestRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRoutes);
router.use('/contact', contactRoutes);
router.use('/users', userRoutes);
router.use('/debug', debugRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/email', emailRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stripe', stripeRoutes);
router.use('/track', trackRoutes); // Public order tracking
router.use('/jobs', jobRoutes); // Jobs and careers
router.use('/blogs', blogRoutes); // Blog system

// Download proxy (admin only)
router.get('/download/resume', protect, authorize('superadmin'), downloadResume);

// Migration endpoint (admin only) - ONE TIME USE
router.post('/migrate/resumes', protect, authorize('superadmin'), migrateResumes);

// Debug endpoint to check application URLs
router.get('/debug/applications', protect, authorize('superadmin'), debugApplications);



// Health check
router.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
