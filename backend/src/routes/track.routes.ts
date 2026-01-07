import { Router } from 'express';
import { trackOrder } from '../controllers/track.controller';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// Public route - no authentication required
// Rate limited to prevent abuse
router.get('/:orderNumber', rateLimiter, trackOrder);

export default router;
