import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/permissions';

const router = Router();

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getReviewStats);
router.get('/:id', reviewController.getReviewById);
router.post('/:id/helpful', reviewController.markHelpful);

// Protected routes (Customer)
router.post('/', protect, reviewController.createReview);
router.get('/user/me', protect, reviewController.getUserReviews);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

// Admin routes
router.get(
  '/',
  protect,
  isAdmin,
  reviewController.getAllReviews
);

router.patch(
  '/:id/status',
  protect,
  isAdmin,
  reviewController.updateReviewStatus
);

export default router;
