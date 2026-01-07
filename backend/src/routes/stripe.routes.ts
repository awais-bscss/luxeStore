import express from 'express';
import { protect } from '../middleware/auth';
import {
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
  createRefund,
} from '../controllers/stripe.controller';

const router = express.Router();

// Create payment intent (requires authentication)
router.post('/create-payment-intent', protect, createPaymentIntent);

// Verify payment (requires authentication)
router.post('/verify-payment', protect, verifyPayment);

// Webhook endpoint (NO authentication - Stripe calls this)
// Note: This needs raw body, configured in server.ts
router.post('/webhook', handleWebhook);

// Create refund (requires authentication and admin role)
router.post('/refund', protect, createRefund);

export default router;
