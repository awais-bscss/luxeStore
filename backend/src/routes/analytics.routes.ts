import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { RESOURCES, ACTIONS } from '../constants';
import { asyncHandler } from '../utils/asyncHandler';
import orderService from '../services/order.service';
import User from '../models/User.model';
import Product from '../models/Product.model';

const router = Router();

// Get analytics dashboard - SuperAdmin ONLY
router.get(
  '/dashboard',
  protect,
  requirePermission(RESOURCES.ANALYTICS, ACTIONS.READ),
  asyncHandler(async (_req: Request, res: Response) => {
    const [orderStats, totalCustomers, totalProducts] = await Promise.all([
      orderService.getOrderStats(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Analytics dashboard data',
      data: {
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.totalOrders,
        totalCustomers,
        totalProducts,
        orderStats,
      },
    });
  })
);

// Get sales analytics - SuperAdmin ONLY
router.get(
  '/sales',
  protect,
  requirePermission(RESOURCES.ANALYTICS, ACTIONS.READ),
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Sales analytics',
      data: [],
    });
  })
);

// Get customer analytics - SuperAdmin ONLY
router.get(
  '/customers',
  protect,
  requirePermission(RESOURCES.ANALYTICS, ACTIONS.READ),
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Customer analytics',
      data: [],
    });
  })
);

// Get product analytics - SuperAdmin ONLY
router.get(
  '/products',
  protect,
  requirePermission(RESOURCES.ANALYTICS, ACTIONS.READ),
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Product analytics',
      data: [],
    });
  })
);

export default router;
