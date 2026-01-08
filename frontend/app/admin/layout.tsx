'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/SettingsContext';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { useToast } from '../../hooks/useToast';
import { logout } from '../../store/slices/authSlice';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Store,
  Check,
  AlertCircle,
  Info,
  TrendingUp,
  ArrowUpRight,
  MessageSquare,
  Mail,
  User,
  Lock,
  Briefcase,
  FileText,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
  { name: 'Products', href: '/admin/products', icon: Package, roles: ['admin', 'superadmin'] },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, roles: ['admin', 'superadmin'] },
  { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['admin', 'superadmin'] },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare, roles: ['admin', 'superadmin'] },
  { name: 'Contact Messages', href: '/admin/contact-messages', icon: Mail, roles: ['admin', 'superadmin'] },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase, roles: ['superadmin'] },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText, roles: ['admin', 'superadmin'] },
  { name: 'Profile', href: '/admin/profile', icon: User, roles: ['admin', 'superadmin'] },
  { name: 'Account Settings', href: '/admin/account', icon: Lock, roles: ['admin', 'superadmin'] },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['superadmin'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['superadmin'] },
];

const mockNotifications: any[] = [];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to replace $ with current currency symbol
const replaceCurrencySymbol = (message: string, currency: string): string => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'PKR': 'Rs',
    'EUR': '€',
    'GBP': '£',
  };

  const currentSymbol = currencySymbols[currency] || '$';

  // Replace $ with current currency symbol
  return message.replace(/\$/g, currentSymbol);
};

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, token } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSidebarCollapsed } = useTheme();
  const currency = useCurrency(); // Get current currency from settings
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  const fetchNotifications = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoadingNotifications(true);
      const response = await fetch(`${API_URL}/notifications?limit=50`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.notifications) {
          setNotifications(data.data.notifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoading) setIsLoadingNotifications(false);
    }
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    if (user) {
      fetchNotifications(true);

      // Poll for new notifications every 15 seconds (faster for better UX)
      const interval = setInterval(() => fetchNotifications(false), 15000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Global search function
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search across products, orders, customers, and reviews
      const [productsRes, ordersRes, customersRes, reviewsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?search=${query}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders?search=${query}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/customers?search=${query}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews?search=${query}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        }).catch(() => null),
      ]);

      const results: any[] = [];

      if (productsRes?.ok) {
        const data = await productsRes.json();
        if (data.success && data.data?.products) {
          const currencySymbol = currency === 'PKR' ? 'Rs' : '$';
          data.data.products.slice(0, 3).forEach((product: any) => {
            results.push({
              type: 'product',
              id: product._id,
              title: product.name,
              subtitle: `${currencySymbol}${product.price} - ${product.category}`,
              link: `/admin/products`,
            });
          });
        }
      }

      if (ordersRes?.ok) {
        const data = await ordersRes.json();
        if (data.success && data.data?.orders) {
          const currencySymbol = currency === 'PKR' ? 'Rs' : '$';
          data.data.orders.slice(0, 3).forEach((order: any) => {
            results.push({
              type: 'order',
              id: order._id,
              title: `Order #${order.orderNumber || order._id.slice(-6)}`,
              subtitle: `${order.user?.name || 'Unknown'} - ${currencySymbol}${order.totalAmount}`,
              link: `/admin/orders`,
            });
          });
        }
      }

      if (customersRes?.ok) {
        const data = await customersRes.json();
        if (data.success && data.data?.customers) {
          data.data.customers.slice(0, 3).forEach((customer: any) => {
            results.push({
              type: 'customer',
              id: customer._id,
              title: customer.name,
              subtitle: customer.email,
              link: `/admin/customers`,
            });
          });
        }
      }

      if (reviewsRes?.ok) {
        const data = await reviewsRes.json();
        if (data.success && data.data?.reviews) {
          data.data.reviews.slice(0, 3).forEach((review: any) => {
            results.push({
              type: 'review',
              id: review._id,
              title: review.product?.name || 'Product Review',
              subtitle: `${review.user?.name || 'Anonymous'} - ${review.rating}⭐`,
              link: `/admin/reviews`,
            });
          });
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications(
          notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        toast.success('Success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error', 'Failed to mark notifications as read');
    }
  };

  const clearAll = async () => {
    try {
      const readCount = notifications.filter(n => n.read).length;

      if (readCount === 0) {
        toast.info('Info', 'No read notifications to clear');
        return;
      }

      const response = await fetch(`${API_URL}/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Remove all read notifications from state
        setNotifications(notifications.filter((n) => !n.read));
        toast.success('Success', `Cleared ${readCount} read notification${readCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Error', 'Failed to clear notifications');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                LuxeStore
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation
            .filter((item) => item.roles.includes(user?.role || 'user'))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer - User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || 'Admin'}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'admin@luxestore.com'}
                </p>
              </div>
            )}
          </div>
          <Link
            href="/admin/profile"
            className="flex items-center justify-between w-full px-3 py-2 mb-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Profile Settings</span>}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                placeholder="Search products, orders, customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSearchResults(false)}
                />

                {/* Results */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-20">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <Link
                          key={`${result.type}-${result.id}-${index}`}
                          href={result.link}
                          onClick={() => setShowSearchResults(false)}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.type === 'product' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              result.type === 'order' ? 'bg-green-100 dark:bg-green-900/30' :
                                result.type === 'review' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                  'bg-purple-100 dark:bg-purple-900/30'
                              }`}>
                              {result.type === 'product' && <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                              {result.type === 'order' && <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />}
                              {result.type === 'customer' && <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                              {result.type === 'review' && <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 capitalize">
                              {result.type}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Store Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap"
              title="View Store"
            >
              <Store className="h-4 w-4" />
              <span className="hidden md:inline">View Store</span>
              <ArrowUpRight className="h-4 w-4 hidden sm:inline" />
            </Link>

            {/* Profile Button */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group whitespace-nowrap"
              title="Profile"
            >
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || 'Admin'}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-500 group-hover:ring-purple-600 transition-all"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-purple-500 group-hover:ring-purple-600 transition-all">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:inline">Profile</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 border border-white dark:border-gray-800">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {unreadCount} unread
                          </p>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={clearAll}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                      {isLoadingNotifications ? (
                        <div className="flex items-center justify-center py-12 ">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 ">
                          <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3 " />
                          <p className="text-gray-500 dark:text-gray-400 text-center">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {notifications.map((notification) => {
                            const typeIcons: any = {
                              order: { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                              product: { icon: Package, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                              review: { icon: MessageSquare, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                              customer: { icon: User, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                              system: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-900/30' },
                              security: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                            };

                            const typeConfig = typeIcons[notification.type] || typeIcons.system;
                            const Icon = typeConfig.icon;

                            return (
                              <div
                                key={notification._id}
                                onClick={() => {
                                  markAsRead(notification._id);
                                  if (notification.link) {
                                    router.push(notification.link);
                                    setNotificationsOpen(false);
                                  }
                                }}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notification.read
                                  ? 'bg-purple-50/50 dark:bg-purple-900/10'
                                  : ''
                                  }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${typeConfig.bg} flex-shrink-0`}>
                                    <Icon className={`h-5 w-5 ${typeConfig.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {replaceCurrencySymbol(notification.message, currency)}
                                        </p>
                                      </div>
                                      {!notification.read && (
                                        <div className="ml-2 h-2 w-2 rounded-full bg-purple-600 flex-shrink-0"></div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {
                      notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                          <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-2">
                            View all notifications
                          </button>
                        </div>
                      )
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Copyright */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} LuxeStore Admin. All rights reserved.
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  Support
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
