"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Truck,
  Shield
} from "lucide-react";
import { RootState } from "@/store/store";
import { useCart } from "@/hooks/useCart";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { isDarkMode } = useTheme();
  const { settings } = useSettings();
  const router = useRouter();
  const toast = useToast();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);

  const shippingCost = total > 100 ? 0 : 10;
  const tax = total * 0.1; // 10% tax
  const grandTotal = total + shippingCost + tax;

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated && !user) {
      toast.error('Login Required', 'Please log in to proceed to checkout');
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen py-12 px-4 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-slate-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 font-semibold mb-6 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl shadow-xl p-12 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex justify-center mb-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Cart is Empty
            </h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-slate-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Shopping Cart
              </h1>
              <p className={`text-gray-500 font-medium`}>
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="hidden md:flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer group"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Clear Cart
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  layout
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`group rounded-3xl p-6 border transition-all duration-500 hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10' : 'bg-white border-gray-100 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/5'}`}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-40 h-40 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={item.thumbnail || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-2xl shadow-sm"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-xl font-extrabold line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-500 transition-colors`}>
                            {item.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {formatPrice(item.price, settings.currency, settings.usdToPkrRate)}
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            per item
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                        <div className={`flex items-center gap-2 rounded-2xl p-1.5 ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-100'}`}>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-200 text-gray-900 border border-gray-200 shadow-sm'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`font-black text-lg min-w-[3.5rem] text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.quantity + 1)
                            }
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-200 text-gray-900 border border-gray-200 shadow-sm'}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-col items-end">
                          <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Subtotal</p>
                          <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatPrice(item.price * item.quantity, settings.currency, settings.usdToPkrRate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Mobile Clear Cart Button */}
            <button
              onClick={handleClearCart}
              className={`md:hidden w-full flex items-center justify-center gap-2 font-semibold py-3 border-2 rounded-xl transition-colors ${isDarkMode ? 'text-red-400 border-red-800 hover:bg-red-900/30' : 'text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50'}`}
            >
              <Trash2 className="w-5 h-5" />
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-xl p-6 sticky top-7 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">{formatPrice(total, settings.currency, settings.usdToPkrRate)}</span>
                </div>
                <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost, settings.currency, settings.usdToPkrRate)
                    )}
                  </span>
                </div>
                <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Tax (10%)</span>
                  <span className="font-semibold">{formatPrice(tax, settings.currency, settings.usdToPkrRate)}</span>
                </div>
                <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(grandTotal, settings.currency, settings.usdToPkrRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {total < 100 && (
                <div className={`border rounded-xl p-4 mb-6 ${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <span className="font-semibold">
                      Add {formatPrice(100 - total, settings.currency, settings.usdToPkrRate)} more
                    </span>{" "}
                    to get <span className="font-semibold">FREE shipping!</span>
                  </p>
                  <div className={`mt-2 rounded-full h-2 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-200'}`}>
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((total / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mb-4"
              >
                <ShoppingBag className="w-5 h-5" />
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className={`w-full border-2 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isDarkMode ? 'border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-400' : 'border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600'}`}
              >
                Continue Shopping
              </Link>

              {/* Features */}
              <div className={`mt-6 pt-6 border-t space-y-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Free Shipping
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      On orders over {formatPrice(100, settings.currency, settings.usdToPkrRate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Secure Payment
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      100% secure transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          clearCart();
          setShowClearModal(false);
          toast.success('Cart Cleared', 'All items have been removed from your cart');
        }}
        title="Clear Cart?"
        message={`Are you sure you want to remove all ${items.length} item${items.length !== 1 ? 's' : ''} from your cart? This action cannot be undone.`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        type="warning"
        showCancel={true}
      />
    </div>
  );
}
