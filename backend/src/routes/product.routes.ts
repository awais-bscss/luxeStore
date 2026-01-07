import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/product.controller';
import { protect } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { RESOURCES, ACTIONS } from '../constants';
import { validate } from '../middleware/validate';
import {
  createProductValidation,
  updateProductValidation,
  updateStockValidation,
} from '../middleware/product.validators';

const router = Router();

// Public routes
router.get('/', (req, res, next) => {
  // If requesting own products, require auth
  if (req.query.createdBy === 'me') {
    return protect(req as any, res, next);
  }
  next();
}, getAllProducts);

router.get('/:id', getProductById);

// Admin & SuperAdmin routes - Create products
router.post(
  '/',
  protect,
  requirePermission(RESOURCES.PRODUCTS, ACTIONS.CREATE),
  createProductValidation,
  validate,
  createProduct
);

// Admin & SuperAdmin routes - Update products
router.put(
  '/:id',
  protect,
  requirePermission(RESOURCES.PRODUCTS, ACTIONS.UPDATE),
  updateProductValidation,
  validate,
  updateProduct
);

// Admin & SuperAdmin routes - Delete products
router.delete(
  '/:id',
  protect,
  requirePermission(RESOURCES.PRODUCTS, ACTIONS.DELETE),
  deleteProduct
);

// Admin & SuperAdmin routes - Update stock
router.patch(
  '/:id/stock',
  protect,
  requirePermission(RESOURCES.PRODUCTS, ACTIONS.UPDATE),
  updateStockValidation,
  validate,
  updateStock
);

export default router;
