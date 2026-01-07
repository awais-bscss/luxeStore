import { Router } from 'express';
import { enable2FA, verify2FA, disable2FA, verify2FALogin } from '../controllers/twoFactor.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/enable', protect, enable2FA);
router.post('/verify', protect, verify2FA);
router.post('/disable', protect, disable2FA);
router.post('/verify-login', verify2FALogin);

export default router;
