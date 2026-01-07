import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { RESOURCES, ACTIONS } from '../constants';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';

const router = Router();

// Get all customers - Admin (READ-ONLY), SuperAdmin (FULL access)
router.get(
  '/',
  protect,
  requirePermission(RESOURCES.CUSTOMERS, ACTIONS.READ),
  asyncHandler(getAllCustomers)
);

// Get customer by ID - Admin (READ-ONLY), SuperAdmin (FULL access)
router.get(
  '/:id',
  protect,
  requirePermission(RESOURCES.CUSTOMERS, ACTIONS.READ),
  asyncHandler(getCustomerById)
);

// Update customer - SuperAdmin ONLY
router.put(
  '/:id',
  protect,
  requirePermission(RESOURCES.CUSTOMERS, ACTIONS.UPDATE),
  asyncHandler(updateCustomer)
);

// Delete customer - SuperAdmin ONLY
router.delete(
  '/:id',
  protect,
  requirePermission(RESOURCES.CUSTOMERS, ACTIONS.DELETE),
  asyncHandler(deleteCustomer)
);

export default router;
