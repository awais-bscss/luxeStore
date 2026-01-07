import { Router } from 'express';
import { debugCarts } from '../controllers/debug.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Debug endpoint - only accessible by superadmin
router.get('/carts', protect, authorize('superadmin'), debugCarts);

export default router;
