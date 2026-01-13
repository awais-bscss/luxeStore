'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
}

export default function StripePaymentForm({ onSuccess, onError, amount }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePayment = async () => {
    if (!stripe || !elements || isProcessing || paymentCompleted) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentCompleted(true); // Permanently mark as completed
        onSuccess(paymentIntent.id);
        // Don't set isProcessing to false - keep button disabled
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
            Secure Payment
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 relative min-h-[250px]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2 animate-pulse">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" />
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" />
              </div>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" />
            </div>
            <p className="text-center text-xs text-gray-500 animate-pulse mt-2">
              Loading secure payment form...
            </p>
          </div>
        )}
        <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
          <PaymentElement onReady={() => setIsLoading(false)} />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || isProcessing || paymentCompleted}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
      >
        {paymentCompleted ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Payment Completed ✓
          </>
        ) : isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay Rs {amount.toFixed(2)}
          </>
        )}
      </button>

      {paymentCompleted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
            ✓ Payment successful! You can now place your order below.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Lock className="w-3 h-3" />
        <span>Powered by Stripe - PCI DSS Compliant</span>
      </div>
    </div>
  );
}
