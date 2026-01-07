"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store/store";
import { useAppDispatch } from "@/hooks/useRedux";
import { createOrder, clearCurrentOrder } from "@/store/slices/orderSlice";
import { clearCartLocal } from "@/store/slices/cartSlice";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { ShoppingCart, CheckCircle, MapPin, User, Phone, Wallet, AlertTriangle, Mail, X, CreditCard, Truck } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useCurrency, useExchangeRate } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/currency";
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false); // Track if order was successfully placed
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVerificationBlockModal, setShowVerificationBlockModal] = useState(false);
  const [taxRate, setTaxRate] = useState(10); // Default 10%
  const [includeTaxInPrices, setIncludeTaxInPrices] = useState(false);

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 50,
    standardShippingCost: 5.99,
    expressShippingCost: 12.99,
    expressShippingEnabled: true,
    standardDeliveryDays: '5-7',
    expressDeliveryDays: '2-3',
  });

  // Stripe payment states
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const currency = useCurrency();
  const exchangeRate = useExchangeRate();

  const { items, total } = useSelector((state: RootState) => state.cart);
  const { currentOrder, isLoading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch tax and shipping settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        if (data.success && data.data.settings) {
          const settings = data.data.settings;
          setTaxRate(settings.taxRate || 10);
          setIncludeTaxInPrices(settings.includeTaxInPrices || false);
          setShippingSettings({
            freeShippingThreshold: settings.freeShippingThreshold || 50,
            standardShippingCost: settings.standardShippingCost || 5.99,
            expressShippingCost: settings.expressShippingCost || 12.99,
            expressShippingEnabled: settings.expressShippingEnabled ?? true,
            standardDeliveryDays: settings.standardDeliveryDays || '5-7',
            expressDeliveryDays: settings.expressDeliveryDays || '2-3',
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    phone: "",
    paymentMethod: "cod" as "cod" | "card",
    shippingMethod: "standard" as "standard" | "express",
    notes: "",
  });

  // Calculate shipping cost based on selected method
  const calculateShippingCost = () => {
    // Free shipping if above threshold
    if (total >= shippingSettings.freeShippingThreshold) {
      return 0;
    }
    // Express shipping
    if (formData.shippingMethod === 'express') {
      return shippingSettings.expressShippingCost;
    }
    // Standard shipping
    return shippingSettings.standardShippingCost;
  };

  const shippingCost = calculateShippingCost();

  // Calculate tax based on includeTaxInPrices setting
  const tax = includeTaxInPrices ? 0 : total * (taxRate / 100);
  const grandTotal = total + shippingCost + tax;

  // Rate limiting for resend verification email
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resendVerificationEmail = async () => {
    // Check if cooldown is active
    if (resendCooldown > 0) {
      toast.error('Please Wait', `You can resend in ${resendCooldown} seconds`);
      return;
    }

    // Check if already sending
    if (isResending) {
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${API_URL}/auth/send-verification`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email Sent', 'Check your inbox for the verification link');
        setResendCooldown(60); // 60 second cooldown
      } else {
        toast.error('Failed', data.message || 'Could not send email');
      }
    } catch (error) {
      toast.error('Error', 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createPaymentIntent = async () => {
    setIsCreatingPaymentIntent(true);
    try {
      const response = await fetch(`${API_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: 'pending',
          shippingMethod: formData.shippingMethod // Send shipping method to backend
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.data.clientSecret);
        setShowStripeForm(true);
        toast.success('Payment Ready', 'Please enter your card details');
      } else {
        toast.error('Error', data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment intent creation error:', error);
      toast.error('Error', 'Failed to initialize payment');
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Cart Empty', 'Please add items to cart before placing order');
      return;
    }

    // Validate card payment is completed
    if (formData.paymentMethod === 'card' && !paymentIntentId) {
      toast.error('Payment Required', 'Please complete the card payment before placing your order');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod, // Include shipping method
        notes: formData.notes,
        paymentIntentId: paymentIntentId || undefined, // Include for card payments
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      setOrderPlaced(true); // Mark order as successfully placed

      // Clear the cart from frontend state immediately after successful order
      // Backend already cleared it, this syncs the frontend
      dispatch(clearCartLocal());

      toast.success('Order Placed!', 'Your order has been placed successfully');

      // Check if email verification is required (first order for unverified user)
      if ((result as any).emailVerificationRequired) {
        setShowVerificationModal(true);
      } else {
        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Order placement failed:', error);

      // IMPORTANT: Don't set orderPlaced to true on error
      // This keeps the cart visible so user can try again

      // Check if account is suspended
      if (error && error.includes && error.includes('suspended')) {
        setShowSuspendedModal(true);
      }
      // Check if email verification is required for second order
      else if (error && error.includes && error.includes('verify your email')) {
        setShowVerificationBlockModal(true);
      }
      else {
        toast.error('Order Failed', error || 'Failed to place order. Please try again.');
      }
      setIsPlacingOrder(false);
    }
  };

  // Only show empty cart if cart is truly empty AND not placing order AND order hasn't been placed
  if (items.length === 0 && !isPlacingOrder && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Add some products to your cart before checking out.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  if (isPlacingOrder && currentOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md">
            <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Order Number: <span className="font-bold">{currentOrder.orderNumber}</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        {/* Email Verification Warning Banner - Only for customers */}
        {user && !user.isEmailVerified && user.role === 'customer' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  ⚠️ Please verify your email to avoid order issues
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Check your inbox for a verification link. You can place 1 order now, but additional orders require email verification.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Lahore"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Punjab"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="54000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="03001234567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <Wallet className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                </div>
                <CustomDropdown
                  value={formData.paymentMethod}
                  onChange={(value) => setFormData({ ...formData, paymentMethod: value as "cod" | "card" })}
                  options={[
                    { value: 'cod', label: 'Cash on Delivery' },
                    { value: 'card', label: 'Credit/Debit Card' },
                  ]}
                />

                {/* Card Payment Integration */}
                {formData.paymentMethod === 'card' && !showStripeForm && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={createPaymentIntent}
                      disabled={isCreatingPaymentIntent}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
                    >
                      {isCreatingPaymentIntent ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Initializing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Continue to Payment
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Stripe Payment Form */}
                {formData.paymentMethod === 'card' && showStripeForm && clientSecret && (
                  <div className="mt-4">
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                        loader: 'auto',
                      }}
                    >
                      <StripePaymentForm
                        amount={grandTotal}
                        onSuccess={(paymentId) => {
                          setPaymentIntentId(paymentId);
                          toast.success('Payment Successful!', 'You can now place your order');
                        }}
                        onError={(error) => {
                          toast.error('Payment Failed', error);
                          setShowStripeForm(false);
                          setClientSecret(null);
                        }}
                      />
                    </Elements>
                  </div>
                )}
              </div>

              {/* Shipping Method */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Method</h2>
                </div>

                {total >= shippingSettings.freeShippingThreshold ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-300">
                          🎉 Free Shipping Unlocked!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Your order qualifies for free standard shipping
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      onClick={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingMethod === 'standard'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === 'standard'
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                            }`}>
                            {formData.shippingMethod === 'standard' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Standard Shipping
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Delivery in {shippingSettings.standardDeliveryDays} business days
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(shippingSettings.standardShippingCost, currency, exchangeRate)}
                        </p>
                      </div>
                    </div>

                    {shippingSettings.expressShippingEnabled && (
                      <div
                        onClick={() => setFormData({ ...formData, shippingMethod: 'express' })}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.shippingMethod === 'express'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === 'express'
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {formData.shippingMethod === 'express' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Express Shipping
                                </p>
                                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                                  FAST
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Delivery in {shippingSettings.expressDeliveryDays} business days
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(shippingSettings.expressShippingCost, currency, exchangeRate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Any special instructions for delivery..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isPlacingOrder || isCreatingPaymentIntent || (formData.paymentMethod === 'card' && !paymentIntentId)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading || isPlacingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : formData.paymentMethod === 'card' && !paymentIntentId ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Complete Payment First
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Place Order - {formatPrice(grandTotal, currency, exchangeRate)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-4">
                    <img
                      src={item.thumbnail || '/placeholder.png'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-blue-600">{formatPrice(item.price * item.quantity, currency, exchangeRate)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(total, currency, exchangeRate)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-semibold" : ""}>
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost, currency, exchangeRate)}
                  </span>
                </div>
                {!includeTaxInPrices && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax ({taxRate}%)</span>
                    <span>{formatPrice(tax, currency, exchangeRate)}</span>
                  </div>
                )}
                {includeTaxInPrices && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 italic">
                    <span>Tax ({taxRate}% included in prices)</span>
                    <span>—</span>
                  </div>
                )}
                <div className="border-t dark:border-gray-700 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal, currency, exchangeRate)}</span>
                </div>
              </div>

              {total < 100 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Add <span className="font-bold">{formatPrice(100 - total, currency, exchangeRate)}</span> more for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Suspended Account Modal */}
      {showSuspendedModal && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowSuspendedModal(false);
                  router.push('/');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Account Suspended
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your account has been suspended and you cannot place orders at this time. Please contact our support team for assistance.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:support@luxestore.com" className="font-semibold hover:text-purple-600 dark:hover:text-purple-400">
                      support@luxestore.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSuspendedModal(false);
                      router.push('/');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    Go Home
                  </button>
                  <button
                    onClick={() => {
                      setShowSuspendedModal(false);
                      router.push('/contact');
                    }}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors text-center"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Email Verification Success Modal (After First Order) */}
      {showVerificationModal && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push('/orders');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Order Placed Successfully!
                </h2>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your order has been confirmed. To place more orders, please verify your email address.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                    📧 Verification email sent to:
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {user?.email}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Check your inbox and click the verification link
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      router.push('/orders');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => {
                      resendVerificationEmail();
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Resend Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Email Verification Block Modal (Second Order Attempt) */}
      {showVerificationBlockModal && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => {
                  setShowVerificationBlockModal(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  🚫 Email Verification Required
                </h2>

                <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  You've already placed one order.
                </p>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Please verify your email to place additional orders.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    📧 Verification email sent to:
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-3">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check your inbox and click the verification link to continue shopping
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowVerificationBlockModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      resendVerificationEmail();
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Resend Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
