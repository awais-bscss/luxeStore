import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getDashboardData } from '../controllers/rbac.example.controller';

const router = Router();

// Test endpoint to check user permissions
router.get('/permissions', protect, getDashboardData);

export default router;
