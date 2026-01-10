"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchUserOrders, archiveOrder, unarchiveOrder, Order, OrderItem } from "@/store/slices/orderSlice";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ShoppingBag,
  Archive,
  ArchiveRestore,
  RotateCcw
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/useToast";
import { formatPrice } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";

export default function OrdersPage() {
  const { isDarkMode } = useTheme();
  const { settings } = useSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { orders, isLoading } = useAppSelector((state: RootState) => state.orders);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    dispatch(fetchUserOrders());
  }, [dispatch, isAuthenticated, router]);

  const handleArchive = async (orderId: string) => {
    try {
      await dispatch(archiveOrder(orderId)).unwrap();
      toast.success('Order Archived', 'Order has been moved to archived orders');
    } catch (error: any) {
      toast.error('Archive Failed', error || 'Failed to archive order');
    }
  };

  const handleUnarchive = async (orderId: string) => {
    try {
      await dispatch(unarchiveOrder(orderId)).unwrap();
      toast.success('Order Restored', 'Order has been restored to active orders');
    } catch (error: any) {
      toast.error('Restore Failed', error || 'Failed to restore order');
    }
  };

  // Filter orders based on archive status
  const filteredOrders = orders.filter(order =>
    showArchived ? order.isArchived : !order.isArchived
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Orders
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className={`inline-flex rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <button
              onClick={() => setShowArchived(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${!showArchived
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${showArchived
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Archive className="w-4 h-4" />
              Archived
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className={`rounded-2xl shadow-xl p-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {showArchived ? (
              <>
                <Archive className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Archived Orders
                </h2>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You haven't archived any orders yet. Archive orders to keep your order list clean!
                </p>
              </>
            ) : (
              <>
                <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Orders Yet
                </h2>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Shopping
                </button>
              </>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order: Order) => (
              <div
                key={order._id}
                className={`rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {/* Return button - only show for delivered orders */}
                    {order.orderStatus === 'delivered' && !showArchived && (
                      <button
                        onClick={() => router.push(`/returns?order=${order.orderNumber}`)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-50 hover:bg-orange-100 text-orange-600'}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Return
                      </button>
                    )}

                    {showArchived ? (
                      <button
                        onClick={() => handleUnarchive(order._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                      >
                        <ArchiveRestore className="w-4 h-4" />
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(order._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {order.items.slice(0, 3).map((item: OrderItem, index: number) => (
                    <div key={index} className="flex gap-4">
                      <img
                        src={item.thumbnail || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Qty: {item.quantity} × {formatPrice(item.price, settings.currency, settings.usdToPkrRate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {formatPrice(item.quantity * item.price, settings.currency, settings.usdToPkrRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className={`border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex gap-6">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Payment
                      </p>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Payment Status
                      </p>
                      <p className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Amount
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(order.totalAmount, settings.currency, settings.usdToPkrRate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
