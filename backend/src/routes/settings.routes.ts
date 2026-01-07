import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { RESOURCES, ACTIONS } from '../constants';
import { getSettings, updateSettings, clearCache } from '../controllers/settings.controller';

const router = Router();

// Public route - anyone can read settings (for currency, store name, etc.)
router.get(
  '/',
  getSettings
);

router.put(
  '/',
  protect,
  requirePermission(RESOURCES.SETTINGS, ACTIONS.UPDATE),
  updateSettings
);

router.post(
  '/clear-cache',
  protect,
  requirePermission(RESOURCES.SETTINGS, ACTIONS.UPDATE),
  clearCache
);

export default router;

