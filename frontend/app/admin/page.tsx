'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { useAppSelector } from '../../hooks/useRedux';
import { formatPrice } from '../../lib/currency';
import { useSettings } from '../../contexts/SettingsContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';





export default function AdminDashboard() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const { settings } = useSettings();
  const [timeRange, setTimeRange] = useState('7d');
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [productGrowth, setProductGrowth] = useState({ change: '0%', trend: 'up' as 'up' | 'down' });
  const [customerCount, setCustomerCount] = useState(0);
  const [customerGrowth, setCustomerGrowth] = useState({ change: '0%', trend: 'up' as 'up' | 'down' });

  // Order statistics state
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderGrowth, setOrderGrowth] = useState({ change: '0%', trend: 'up' as 'up' | 'down' });
  const [revenueGrowth, setRevenueGrowth] = useState({ change: '0%', trend: 'up' as 'up' | 'down' });

  // Recent orders state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Dynamic stats array that updates with state changes
  const stats = [
    {
      name: 'Total Revenue',
      value: formatPrice(totalRevenue, settings.currency, settings.usdToPkrRate),
      change: revenueGrowth.change,
      trend: revenueGrowth.trend,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Orders',
      value: String(orderCount),
      change: orderGrowth.change,
      trend: orderGrowth.trend,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Customers',
      value: String(customerCount),
      change: customerGrowth.change,
      trend: customerGrowth.trend,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Products',
      value: String(productCount),
      change: productGrowth.change,
      trend: productGrowth.trend,
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  // Fetch products and calculate growth
  useEffect(() => {
    const fetchProductsWithGrowth = async () => {
      try {
        setProductsLoading(true);

        // Calculate date ranges based on selected time period
        const now = new Date();
        const ranges: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
        const days = ranges[timeRange] || 7;
        const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

        // Fetch all products for display
        const totalResponse = await fetch(
          `${API_URL}/products?limit=5&sort=-createdAt&populate=createdBy`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        // Fetch current period products (for growth calculation)
        const currentResponse = await fetch(
          `${API_URL}/products?createdAt[gte]=${currentStart.toISOString()}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        // Fetch previous period products (for comparison)
        const previousResponse = await fetch(
          `${API_URL}/products?createdAt[gte]=${previousStart.toISOString()}&createdAt[lt]=${currentStart.toISOString()}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        if (totalResponse.ok && currentResponse.ok && previousResponse.ok) {
          const totalData = await totalResponse.json();
          const currentData = await currentResponse.json();
          const previousData = await previousResponse.json();

          const totalCount = totalData.data?.pagination?.total || 0;
          const currentCount = currentData.data?.pagination?.total || 0;
          const previousCount = previousData.data?.pagination?.total || 0;

          console.log('=== PRODUCT GROWTH CALCULATION ===');
          console.log('Total products:', totalCount);
          console.log('Current period products:', currentCount);
          console.log('Previous period products:', previousCount);

          // Calculate percentage change
          let percentageChange = 0;
          let trend: 'up' | 'down' = 'up';

          if (previousCount > 0) {
            // Normal case: compare current period to previous period
            percentageChange = ((currentCount - previousCount) / previousCount) * 100;
            trend = percentageChange >= 0 ? 'up' : 'down';
          } else if (currentCount > 0 && totalCount > 0) {
            // If no previous period data, calculate based on current vs total
            // This shows what % of total products were added in current period
            percentageChange = (currentCount / totalCount) * 100;
            trend = 'up';
          } else if (currentCount > 0) {
            // All products are new in this period
            percentageChange = 100;
            trend = 'up';
          }

          const changeText = `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;

          console.log('Percentage change:', percentageChange);
          console.log('Change text:', changeText);
          console.log('Trend:', trend);

          // Update state
          setProducts(totalData.data?.products || []);
          setProductCount(totalCount);
          setProductGrowth({ change: changeText, trend });
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        // If rate limited or other error, set default values
        setProductCount(0);
        setProductGrowth({ change: '0%', trend: 'up' });
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductsWithGrowth();
  }, [timeRange]);

  // Fetch customers and calculate growth
  useEffect(() => {
    const fetchCustomersWithGrowth = async () => {
      try {
        // Calculate date ranges based on selected time period
        const now = new Date();
        const ranges: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
        const days = ranges[timeRange] || 7;
        const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

        // Fetch total customers count
        const totalResponse = await fetch(
          `${API_URL}/users/customers`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        // Fetch current period customers (for growth calculation)
        const currentResponse = await fetch(
          `${API_URL}/users/customers?createdAt[gte]=${currentStart.toISOString()}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        // Fetch previous period customers (for comparison)
        const previousResponse = await fetch(
          `${API_URL}/users/customers?createdAt[gte]=${previousStart.toISOString()}&createdAt[lt]=${currentStart.toISOString()}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include'
          }
        );

        if (totalResponse.ok && currentResponse.ok && previousResponse.ok) {
          const totalData = await totalResponse.json();
          const currentData = await currentResponse.json();
          const previousData = await previousResponse.json();

          const totalCount = totalData.data?.pagination?.total || 0;
          const currentCount = currentData.data?.pagination?.total || 0;
          const previousCount = previousData.data?.pagination?.total || 0;

          console.log('=== CUSTOMER GROWTH CALCULATION ===');
          console.log('Total customers:', totalCount);
          console.log('Current period customers:', currentCount);
          console.log('Previous period customers:', previousCount);

          // Calculate percentage change
          let percentageChange = 0;
          let trend: 'up' | 'down' = 'up';

          if (previousCount > 0) {
            // Normal case: compare current period to previous period
            percentageChange = ((currentCount - previousCount) / previousCount) * 100;
            trend = percentageChange >= 0 ? 'up' : 'down';
          } else if (currentCount > 0 && totalCount > 0) {
            // If no previous period data, calculate based on current vs total
            // This shows what % of total customers were added in current period
            percentageChange = (currentCount / totalCount) * 100;
            trend = 'up';
          } else if (currentCount > 0) {
            // All customers are new in this period
            percentageChange = 100;
            trend = 'up';
          }

          const changeText = `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;

          console.log('Percentage change:', percentageChange);
          console.log('Change text:', changeText);
          console.log('Trend:', trend);

          // Update state
          setCustomerCount(totalCount);
          setCustomerGrowth({ change: changeText, trend });
        }
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        // If rate limited or other error, set default values
        setCustomerCount(0);
        setCustomerGrowth({ change: '0%', trend: 'up' });
      }
    };

    fetchCustomersWithGrowth();
  }, [timeRange]);

  // Fetch order statistics
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch(`${API_URL}/orders/stats/overview`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Order stats response:', data); // Debug log
          if (data.success && data.data) {
            const stats = data.data;
            console.log('Full stats:', stats); // Debug
            setOrderCount(stats.totalOrders || 0);
            setTotalRevenue(stats.totalRevenue || 0);

            // Calculate order success rate (active orders vs cancelled)
            const cancelledOrders = stats.cancelledOrders || 0;
            const totalOrders = stats.totalOrders || 0;

            // Success rate: percentage of orders that are NOT cancelled
            const activeOrders = totalOrders - cancelledOrders;
            const successRate = totalOrders > 0 ? (activeOrders / totalOrders) * 100 : 0;
            setOrderGrowth({
              change: `+${successRate.toFixed(1)}%`,
              trend: successRate >= 80 ? 'up' : 'down'
            });

            // Always calculate and show revenue growth
            const revenuePercent = stats.totalRevenue > 0 ? 100 : 0;
            setRevenueGrowth({
              change: `+${revenuePercent.toFixed(1)}%`,
              trend: 'up'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching order stats:', error);
        setOrderCount(0);
        setTotalRevenue(0);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrderStats();

    // Also fetch recent orders
    const fetchRecentOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders?limit=5&sort=-createdAt`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.orders) {
            setRecentOrders(data.data.orders);
          }
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* UPDATED: Changed to flex-col on mobile (default) and flex-row on sm screens for responsiveness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* UPDATED: Professional Dropdown Styling */}
        <CustomDropdown
          value={timeRange}
          onChange={(value) => setTimeRange(value)}
          options={[
            { value: '24h', label: 'Last 24 hours' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div
                className={`flex items-center space-x-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <button
              onClick={() => router.push('/admin/orders')}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {ordersLoading ? (
              // Skeleton loading
              [...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg animate-pulse">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {order.user?.name || 'Guest'} • {order.items?.[0]?.name || 'Multiple items'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(order.totalAmount || 0, settings.currency, settings.usdToPkrRate)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Latest Products
            </h2>
            <Link
              href="/admin/products"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              View all
            </Link>
          </div>

          {productsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        Stock: {product.stock} • {product.category}
                        {product.createdBy && (
                          <span className="ml-2">
                            • Created by: <span className="font-medium text-purple-600 dark:text-purple-400">{product.createdBy.name}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(product.price, settings.currency, settings.usdToPkrRate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No products found</p>
              <Link
                href="/admin/products/add"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/products/add" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <Package className="h-6 w-6 mb-2" />
            <p className="font-medium">Add Product</p>
            <p className="text-sm text-white/80 mt-1">Create new product</p>
          </Link>
          <Link href="/admin/orders" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <ShoppingCart className="h-6 w-6 mb-2" />
            <p className="font-medium">View Orders</p>
            <p className="text-sm text-white/80 mt-1">Manage all orders</p>
          </Link>
          <Link href="/admin/customers" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <Users className="h-6 w-6 mb-2" />
            <p className="font-medium">Customers</p>
            <p className="text-sm text-white/80 mt-1">View customer list</p>
          </Link>
          <Link href="/admin/analytics" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
            <TrendingUp className="h-6 w-6 mb-2" />
            <p className="font-medium">Analytics</p>
            <p className="text-sm text-white/80 mt-1">View detailed reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

