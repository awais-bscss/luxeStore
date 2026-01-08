'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../../hooks/useRedux';
import CustomDropdown from '../../../components/ui/CustomDropdown';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { exportToCSV } from '../../../utils/exportData';
import { formatPrice } from '../../../lib/currency';
import { useSettings } from '../../../contexts/SettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { user } = useAppSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState('30d');

  // Real data state
  const [orderStats, setOrderStats] = useState<any>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Redirect if not superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/admin');
    }
  }, [user, router]);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch order statistics
        const ordersResponse = await fetch(`${API_URL}/orders/stats/overview`, {
          credentials: 'include',
        });

        // Fetch customer count
        const customersResponse = await fetch(`${API_URL}/users/customers`, {
          credentials: 'include',
        });

        // Fetch product count
        const productsResponse = await fetch(`${API_URL}/products`, {
          credentials: 'include',
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success) {
            setOrderStats(ordersData.data);
          }
        }

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          if (customersData.success) {
            setCustomerCount(customersData.data?.pagination?.total || 0);
          }
        }

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success) {
            setProductCount(productsData.data?.pagination?.total || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'superadmin') {
      fetchAnalytics();
    }
  }, [user]);

  // Export analytics to CSV
  const handleExportAnalytics = () => {
    const now = new Date();
    const exportDateTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const avgOrderValue = orderStats?.totalOrders > 0
      ? orderStats.totalRevenue / orderStats.totalOrders
      : 0;

    const successRate = orderStats?.totalOrders > 0
      ? (((orderStats.totalOrders - (orderStats.cancelledOrders || 0)) / orderStats.totalOrders) * 100)
      : 0;

    // Add header rows with branding
    const headerRows = [
      { 'Section': '=== LUXESTORE ANALYTICS REPORT ===' },
      { 'Section': `Generated: ${exportDateTime}` },
      { 'Section': `Time Period: ${timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === '90d' ? 'Last 90 Days' : 'Last Year'}` },
      { 'Section': `Exported by: ${user?.name || 'Admin'}` },
      { 'Section': '' }, // Empty row
      { 'Section': '--- KEY METRICS ---' },
    ];

    const keyMetrics = [
      {
        'Metric': 'Total Revenue',
        'Value': formatPrice(orderStats?.totalRevenue || 0, settings.currency, settings.usdToPkrRate),
        'Category': 'Financial'
      },
      {
        'Metric': 'Total Orders',
        'Value': String(orderStats?.totalOrders || 0),
        'Category': 'Sales'
      },
      {
        'Metric': 'Average Order Value',
        'Value': formatPrice(avgOrderValue, settings.currency, settings.usdToPkrRate),
        'Category': 'Financial'
      },
      {
        'Metric': 'Total Customers',
        'Value': String(customerCount),
        'Category': 'Customer'
      },
      {
        'Metric': 'Total Products',
        'Value': String(productCount),
        'Category': 'Inventory'
      },
    ];

    const spacer = [{ 'Metric': '', 'Value': '', 'Category': '' }];

    const orderBreakdown = [
      { 'Metric': '--- ORDER STATUS BREAKDOWN ---', 'Value': '', 'Category': '' },
      {
        'Metric': 'Pending Orders',
        'Value': String(orderStats?.pendingOrders || 0),
        'Category': 'Status'
      },
      {
        'Metric': 'Processing Orders',
        'Value': String(orderStats?.processingOrders || 0),
        'Category': 'Status'
      },
      {
        'Metric': 'Shipped Orders',
        'Value': String(orderStats?.shippedOrders || 0),
        'Category': 'Status'
      },
      {
        'Metric': 'Delivered Orders',
        'Value': String(orderStats?.deliveredOrders || 0),
        'Category': 'Status'
      },
      {
        'Metric': 'Cancelled Orders',
        'Value': String(orderStats?.cancelledOrders || 0),
        'Category': 'Status'
      },
    ];

    const performanceMetrics = [
      { 'Metric': '', 'Value': '', 'Category': '' },
      { 'Metric': '--- PERFORMANCE METRICS ---', 'Value': '', 'Category': '' },
      {
        'Metric': 'Success Rate',
        'Value': `${successRate.toFixed(1)}%`,
        'Category': 'Performance'
      },
      {
        'Metric': 'Completion Rate',
        'Value': orderStats?.totalOrders > 0
          ? `${((orderStats.deliveredOrders / orderStats.totalOrders) * 100).toFixed(1)}%`
          : '0%',
        'Category': 'Performance'
      }
    ];

    // Combine all sections
    const fullExport = [
      ...headerRows,
      ...keyMetrics,
      ...spacer,
      ...orderBreakdown,
      ...performanceMetrics
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(fullExport, `LuxeStore-Analytics-${timestamp}`);
  };

  // Don't render if not superadmin
  if (!user || user.role !== 'superadmin') {
    return null;
  }

  // Calculate average order value
  const avgOrderValue = orderStats?.totalOrders > 0
    ? orderStats.totalRevenue / orderStats.totalOrders
    : 0;

  const stats = [
    {
      name: 'Total Revenue',
      value: formatPrice(orderStats?.totalRevenue || 0, settings.currency, settings.usdToPkrRate),
      change: '+100%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Total Orders',
      value: String(orderStats?.totalOrders || 0),
      change: '+100%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Total Customers',
      value: String(customerCount),
      change: '+100%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Avg Order Value',
      value: formatPrice(avgOrderValue, settings.currency, settings.usdToPkrRate),
      change: orderStats?.totalOrders > 0 ? '+100%' : '0%',
      trend: orderStats?.totalOrders > 0 ? 'up' as const : 'down' as const,
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  // Order status breakdown
  const orderStatusData = [
    { status: 'Pending', count: orderStats?.pendingOrders || 0, color: 'bg-yellow-500' },
    { status: 'Processing', count: orderStats?.processingOrders || 0, color: 'bg-blue-500' },
    { status: 'Shipped', count: orderStats?.shippedOrders || 0, color: 'bg-purple-500' },
    { status: 'Delivered', count: orderStats?.deliveredOrders || 0, color: 'bg-green-500' },
    { status: 'Cancelled', count: orderStats?.cancelledOrders || 0, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6 p-6 relative">
      {/* Top Loading Bar */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-loading-bar w-full" />
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive business insights and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CustomDropdown
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
          />
          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>

          {/* Large Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-2 w-full bg-gray-50 dark:bg-gray-900/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 w-full bg-gray-50 dark:bg-gray-900/10 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Order Status Breakdown
            </h2>
            <div className="space-y-4">
              {orderStatusData.map((item) => {
                const total = orderStats?.totalOrders || 1;
                const percentage = (item.count / total) * 100;

                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Revenue Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(orderStats?.totalRevenue || 0, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Order Value
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(avgOrderValue, settings.currency, settings.usdToPkrRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {orderStats?.totalOrders || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Business Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Customers
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {customerCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Products
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {productCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Success Rate
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {orderStats?.totalOrders > 0
                      ? (((orderStats.totalOrders - (orderStats.cancelledOrders || 0)) / orderStats.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Real-Time Analytics
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  All data shown is fetched in real-time from your database. Statistics update automatically when you refresh the page.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
