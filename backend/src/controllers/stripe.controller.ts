import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import stripeService from '../services/stripe.service';
import Cart from '../models/Cart.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError } from '../utils/errors';

/**
 * Create Payment Intent
 * Called when user initiates Stripe checkout
 * Amount is calculated on backend to prevent tampering
 */
export const createPaymentIntent = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId, shippingMethod } = req.body; // Accept shippingMethod from frontend
    const userId = req.user!._id;

    // Get user's cart to calculate amount
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Get system settings for accurate calculation
    const SystemSettings = (await import('../models/SystemSettings.model')).default;
    const settings = await SystemSettings.findOne();

    // Calculate total amount in base currency (PKR)
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Business Logic: Handle Currency Conversion for Settings
    // If display currency is USD, settings values like 'freeShippingThreshold' are in USD and must be converted to PKR
    const rate = settings?.usdToPkrRate || 280;
    const isUSD = settings?.currency === 'USD';

    const thresholdPKR = isUSD ? (settings?.freeShippingThreshold || 50) * rate : (settings?.freeShippingThreshold || 50);
    const standardShippingPKR = isUSD ? (settings?.standardShippingCost || 5.99) * rate : (settings?.standardShippingCost || 5.99);
    const expressShippingPKR = isUSD ? (settings?.expressShippingCost || 12.99) * rate : (settings?.expressShippingCost || 12.99);

    let shippingCost = 0;
    if (subtotal >= thresholdPKR) {
      shippingCost = 0; // Free shipping
    } else if (shippingMethod === 'express') {
      shippingCost = expressShippingPKR;
    } else {
      shippingCost = standardShippingPKR; // Default to standard
    }

    // Calculate tax based on settings
    const taxRate = settings?.taxRate || 10;
    const includeTaxInPrices = settings?.includeTaxInPrices || false;
    const tax = includeTaxInPrices ? 0 : subtotal * (taxRate / 100);

    // Total amount in PKR (Base Currency)
    const totalAmount = subtotal + shippingCost + tax;

    // Stripe requires amount in smallest currency unit (paisa for PKR)
    // 1 PKR = 100 paisa
    const amountInPaisa = Math.round(totalAmount * 100);

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: amountInPaisa,
      currency: 'pkr', // Pakistani Rupee
      orderId: orderId || 'pending',
      customerEmail: req.user!.email,
      customerName: req.user!.name,
      metadata: {
        userId: userId.toString(),
        cartItemCount: cart.items.length.toString(),
        shippingMethod: shippingMethod || 'standard',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amount: totalAmount,
      },
    });
  }
);

/**
 * Verify Payment
 * Called after payment is completed to verify before creating order
 */
export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw new ValidationError('Payment intent ID is required');
    }

    const paymentDetails = await stripeService.verifyPaymentIntent(paymentIntentId);

    // Check if payment was successful
    if (paymentDetails.status !== 'succeeded') {
      throw new ValidationError(`Payment ${paymentDetails.status}`);
    }

    res.status(200).json({
      success: true,
      data: {
        status: paymentDetails.status,
        amount: paymentDetails.amount / 100, // Convert back to dollars
        currency: paymentDetails.currency.toUpperCase(),
      },
    });
  }
);

/**
 * Stripe Webhook Handler
 * Receives events from Stripe (payment success, failure, refunds, etc.)
 */
export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new ValidationError('Missing stripe signature');
    }

    // Raw body is needed for signature verification
    const payload = req.body;

    await stripeService.handleWebhook(payload, signature);

    res.status(200).json({ received: true });
  }
);

/**
 * Create Refund
 * Admin endpoint to refund a payment
 */
export const createRefund = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      throw new ValidationError('Payment intent ID is required');
    }

    const refund = await stripeService.createRefund(
      paymentIntentId,
      amount ? Math.round(amount * 100) : undefined // Convert to cents if provided
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.refundId,
        status: refund.status,
        amount: refund.amount / 100, // Convert back to dollars
      },
    });
  }
);
