import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { checkMaintenanceMode } from '../middleware/maintenance';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  archiveOrder,
  unarchiveOrder,
} from '../controllers/order.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// User routes (with maintenance mode check for order creation)
router.post('/', checkMaintenanceMode, createOrder); // Create order from cart
router.get('/my-orders', getUserOrders); // Get user's orders
router.get('/:id', getOrderById); // Get single order
router.put('/:id/cancel', cancelOrder); // Cancel order
router.put('/:id/archive', archiveOrder); // Archive order
router.put('/:id/unarchive', unarchiveOrder); // Unarchive order

// Admin routes
router.get('/', authorize('admin', 'superadmin'), getAllOrders); // Get all orders
router.put('/:id/status', authorize('admin', 'superadmin'), updateOrderStatus); // Update order status
router.put('/:id/payment', authorize('admin', 'superadmin'), updatePaymentStatus); // Update payment status
router.get('/stats/overview', authorize('admin', 'superadmin'), getOrderStats); // Get order statistics

export default router;
