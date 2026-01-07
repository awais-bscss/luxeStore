import { Router } from 'express';
import { protect } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';
import {
  sendVerificationEmail,
  verifyEmail,
} from '../controllers/emailVerification.controller';

const router = Router();

// Send verification email (protected - user must be logged in)
// Rate limited to prevent spam
router.post('/send-verification', protect, rateLimiter, sendVerificationEmail);

// Verify email with token (public - anyone with token can verify)
router.get('/verify-email/:token', verifyEmail);

export default router;
