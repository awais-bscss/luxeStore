"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
import { Package, Search, MapPin, Truck, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  date: string | null;
  completed: boolean;
}

interface TrackingData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  shippingMethod: string;
  createdAt: string;
  estimatedDelivery: string;
  timeline: TrackingStep[];
  shippingAddress: any;
  items: any[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export default function TrackOrderPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state);
  const { settings } = useSettings();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    setError("");
    setTrackingData(null);

    try {
      const data = await apiClient(`/track/${orderNumber}`, {
        params: { email }
      }, dispatch, state);

      if (data.success) {
        setTrackingData(data.data);
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message || 'Failed to track order. Please check your order number and email.');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Pending';
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Track Your Order</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Enter your order number and email to track your package in real-time
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Tracking Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Enter Tracking Information
          </h2>
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-123456"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isTracking}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isTracking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Order #{trackingData.orderNumber}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Estimated delivery: {trackingData.estimatedDelivery}
                </p>
                {/* Shipping Method Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${trackingData.shippingMethod === 'express'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                  {trackingData.shippingMethod === 'express' ? '⚡ Express Delivery (3 days)' : '📦 Standard Delivery (7 days)'}
                </span>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(trackingData.status || 'pending')}`}>
                  {formatStatus(trackingData.status || 'pending')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Payment: {formatStatus(trackingData.paymentStatus || 'pending')}
                </span>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Tracking Timeline
              </h4>
              <div className="relative">
                {trackingData.timeline.map((step, index) => (
                  <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
                    {/* Timeline Line */}
                    {index < trackingData.timeline.length - 1 && (
                      <div className={`absolute left-6 top-14 w-0.5 h-full ${step.completed
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                        }`} />
                    )}

                    {/* Icon */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                      {step.status === 'confirmed' && <CheckCircle className="w-6 h-6" />}
                      {step.status === 'processing' && <Package className="w-6 h-6" />}
                      {step.status === 'shipped' && <Truck className="w-6 h-6" />}
                      {step.status === 'out_for_delivery' && <MapPin className="w-6 h-6" />}
                      {step.status === 'delivered' && <CheckCircle className="w-6 h-6" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {step.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {step.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(trackingData.subtotal || 0, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(trackingData.shippingCost || 0, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(trackingData.tax || 0, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {formatPrice(trackingData.total || 0, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
          <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Need Help with Your Order?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about your order or shipment, our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
