"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RootState } from "@/store/store";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { fetchOrderById, cancelOrder } from "@/store/slices/orderSlice";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { formatPrice } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  Phone
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/useToast";

export default function OrderDetailsPage() {
  const { isDarkMode } = useTheme();
  const { settings } = useSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const orderId = params.id as string;

  const { items: cartItems } = useAppSelector((state: RootState) => state.cart);
  const { currentOrder, isLoading } = useAppSelector((state: RootState) => state.orders);
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  // Determine back URL based on user role
  const backUrl = user?.role === 'admin' || user?.role === 'superadmin' ? '/admin/orders' : '/orders';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId, isAuthenticated, router]);

  const handleCancelOrder = async () => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      toast.success('Order Cancelled', 'Your order has been cancelled successfully');
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error('Cancellation Failed', error || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = currentOrder && ['pending', 'processing'].includes(currentOrder.orderStatus);

  if (isLoading || !currentOrder) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(backUrl)}
          className={`flex items-center gap-2 mb-6 font-semibold transition-colors cursor-pointer ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className={`rounded-2xl shadow-md p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order #{currentOrder.orderNumber}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Placed on {formatDate(currentOrder.createdAt)}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(currentOrder.orderStatus)}`}>
                {currentOrder.orderStatus.charAt(0).toUpperCase() + currentOrder.orderStatus.slice(1)}
              </span>
              {canCancelOrder && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-2xl shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Items
              </h2>
              <div className="space-y-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className={`flex gap-4 pb-4 ${index !== currentOrder.items.length - 1 ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`}>
                    <img
                      src={item.thumbnail || '/placeholder.png'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quantity: {item.quantity}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Price: {formatPrice(item.price, settings.currency, settings.usdToPkrRate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {formatPrice(item.quantity * item.price, settings.currency, settings.usdToPkrRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className={`rounded-2xl shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Shipping Address
                </h2>
              </div>
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>{currentOrder.shippingAddress.street}</p>
                <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}</p>
                <p>{currentOrder.shippingAddress.country}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-4 h-4" />
                  <p>{currentOrder.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-md p-6 sticky top-28 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatPrice(currentOrder.subtotal, settings.currency, settings.usdToPkrRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
                  <span className={currentOrder.shippingCost === 0 ? 'text-green-600 font-semibold' : isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {currentOrder.shippingCost === 0 ? 'FREE' : formatPrice(currentOrder.shippingCost, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tax</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatPrice(currentOrder.tax, settings.currency, settings.usdToPkrRate)}</span>
                </div>
                <div className={`border-t pt-3 flex justify-between text-lg font-bold ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                  <span>Total</span>
                  <span>{formatPrice(currentOrder.totalAmount, settings.currency, settings.usdToPkrRate)}</span>
                </div>
              </div>

              <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentOrder.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status</p>
                  <p className={`font-semibold ${currentOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                  </p>
                </div>
              </div>

              {currentOrder.notes && (
                <div className={`mt-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order Notes</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowCancelModal(false)}
          />
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl p-6 z-[60] w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cancel Order?
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className={`flex-1 px-4 py-3 border-2 font-semibold rounded-xl transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </>
      )}

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
