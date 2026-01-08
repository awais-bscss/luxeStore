import Stripe from 'stripe';
import { ValidationError } from '../utils/errors';

// Lazy initialization of Stripe
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new ValidationError(
        'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.'
      );
    }

    stripeInstance = new Stripe(secretKey, {
      // apiVersion: '...', // Removed invalid version to use account default
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 30000,
    });
  }

  return stripeInstance;
}

interface CreatePaymentIntentData {
  amount: number; // Amount in cents
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

class StripeService {
  /**
   * Create a Payment Intent for Stripe checkout
   * This is called from the backend to ensure amount cannot be tampered with
   */
  async createPaymentIntent(data: CreatePaymentIntentData) {
    try {
      // Validate amount (must be positive and reasonable)
      if (data.amount <= 0) {
        throw new ValidationError('Invalid payment amount');
      }

      // Maximum amount check (prevent accidental large charges)
      const MAX_AMOUNT = 1000000; // $10,000 in cents
      if (data.amount > MAX_AMOUNT) {
        throw new ValidationError('Payment amount exceeds maximum allowed');
      }

      // Create payment intent
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: Math.round(data.amount), // Ensure integer
        currency: data.currency.toLowerCase(),
        payment_method_types: ['card'], // Only allow card payments (no crypto, Cash App, Amazon Pay)
        metadata: {
          orderId: data.orderId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          ...data.metadata,
        },
        description: `Order #${data.orderId}`,
        receipt_email: data.customerEmail,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('--- STRIPE DIAGNOSTIC ERROR ---');
      console.error('Type:', error.type);
      console.error('Message:', error.message);
      if (error.code) console.error('Code:', error.code);
      if (error.detail) console.error('Detail:', error.detail);
      console.error('--------------------------------');

      // Provide more specific error messages
      if (error.type === 'StripeConnectionError') {
        throw new ValidationError(`Unable to connect to Stripe (${error.message || 'System error'}). Please verify your server's outgoing internet connection.`);
      }

      if (error.type === 'StripeAuthenticationError') {
        throw new ValidationError('Stripe authentication failed. Please verify that your STRIPE_SECRET_KEY environment variable is correct.');
      }

      if (error.type === 'StripeAPIError') {
        throw new ValidationError('Stripe service is temporarily unavailable. Please try again later.');
      }

      throw new ValidationError(error.message || 'Failed to create payment intent');
    }
  }

  /**
   * Verify payment intent status
   * Used to confirm payment was successful before creating order
   */
  async verifyPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error: any) {
      console.error('Stripe payment verification error:', error);
      throw new ValidationError('Failed to verify payment');
    }
  }

  /**
   * Handle Stripe webhook events
   * Used for production to handle async payment confirmations
   */
  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      // Verify webhook signature
      const event = getStripe().webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          break;
      }

      return { received: true };
    } catch (error: any) {
      console.error('Webhook error:', error);
      throw new Error(`Webhook Error: ${error.message}`);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(_paymentIntent: Stripe.PaymentIntent) {
    // TODO: Update order status to 'paid' in database
    // This is handled by the order service after payment confirmation
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(_paymentIntent: Stripe.PaymentIntent) {
    // TODO: Update order status to 'payment_failed' in database
    // Optionally restore stock if it was already deducted
  }

  /**
   * Handle refund
   */
  private async handleRefund(_charge: Stripe.Charge) {
    // TODO: Update order status and restore stock
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await getStripe().refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount) : undefined, // Partial or full refund
      });

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
      };
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      throw new ValidationError('Failed to process refund');
    }
  }
}

export default new StripeService();
