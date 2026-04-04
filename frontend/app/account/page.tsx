"use client";

// IMPORTS
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { useSearchParams, useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, Edit2, Shield, Bell, Key, AlertTriangle, Loader2, Eye, EyeOff, ShoppingCart, ArrowRight, LayoutDashboard, CheckCircle, Lock } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useSettings } from "@/contexts/SettingsContext";
import { logout } from "@/store/slices/authSlice";
import { apiClient } from "@/lib/api/client";

// COMPONENT
export default function AccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { settings } = useSettings();
  const state = useAppSelector((state: RootState) => state);
  const { user, isPasswordExpired } = state.auth;
  const toast = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle search params for tab navigation and expiry reason
  useEffect(() => {
    const tab = searchParams.get("tab");
    const reason = searchParams.get("reason");

    if (tab) {
      setActiveTab(tab);
    }

    if (reason === "password_expired") {
      toast.warning("Action Required", "Your password has expired. Please change it to continue.");
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await dispatch(logout() as any);
    router.push("/");
    toast.info("Logged Out", "You have been successfully logged out.");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Error", "Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const data = await apiClient('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
      }, dispatch, state);

      if (data.success) {
        toast.success("Success", "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        // If they were expired, we should probably refresh their state or tell them to re-login
        if (isPasswordExpired) {
          toast.info("Session Updated", "Security policy updated. Please log in again with your new password.");
          handleLogout();
        }
      }
    } catch (err: any) {
      toast.error("Error", err.message || "An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "orders", name: "Orders", icon: Package },
    { id: "favorites", name: "Favorites", icon: Heart },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  const recentOrders = [
    { id: "#ORD-001", date: "Dec 5, 2024", status: "Delivered", total: 299.99, items: 3 },
    { id: "#ORD-002", date: "Dec 1, 2024", status: "Shipped", total: 159.99, items: 2 },
    { id: "#ORD-003", date: "Nov 28, 2024", status: "Processing", total: 89.99, items: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Professional Profile Header */}
      <div className="bg-[#0F172A] pt-32 pb-40 relative overflow-hidden text-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1 shadow-2xl transition-transform duration-300">
                <div className="w-full h-full rounded-[14px] bg-[#1E293B] flex items-center justify-center overflow-hidden border-2 border-[#0F172A]">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white/50" />
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 text-purple-600 rounded-lg shadow-lg hover:scale-110 transition-all border border-gray-100 dark:border-gray-700">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {user?.name || "Guest User"}
                </h1>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold text-pink-400 uppercase tracking-widest border border-white/10">
                  {user?.role || "Member"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 font-medium">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <Package className="w-4 h-4 text-pink-500" />
                  <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Exact Dashboard Sidebar Matching */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <div className="mb-6 px-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account Overview</p>
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                          ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
                        <span>{tab.name}</span>
                        {isActive && <div className="ml-auto w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Content Area - Rounded XL Cards */}
          <div className="lg:col-span-9">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Orders', value: '12', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
                    { label: 'Favorites', value: '24', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
                    { label: 'Total Spent', value: formatPrice(2450.00, settings.currency, settings.usdToPkrRate), icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Details</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your identity information</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: User, label: 'Full Name', value: user?.name },
                      { icon: Mail, label: 'Email Address', value: user?.email }
                    ].map((field, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <field.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{field.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Purchase History</h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{order.id}</p>
                            <p className="text-xs text-gray-400">{order.date}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{order.items} Items</p>
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total, settings.currency, settings.usdToPkrRate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-16 border border-gray-200 dark:border-gray-700 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Explore our collection and save your favorite items for later.</p>
                <button 
                  onClick={() => router.push('/products')}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all inline-flex items-center gap-2"
                >
                  Shop Products <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isPasswordExpired && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-red-900 dark:text-red-400 font-bold mb-1">Security Update Required</h3>
                      <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">Your current password has expired. Please synchronize your account with new credentials to restore full access.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Key className="w-5 h-5 text-purple-600" /></div>
                    Password Security
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-2xl">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm current identity"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-600 rounded-lg outline-none transition-all dark:text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="Min 6 characters"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-600 rounded-lg outline-none transition-all dark:text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Repeat new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-600 rounded-lg outline-none transition-all dark:text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-lg hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2 group"
                      >
                        {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            <Shield className="w-4 h-4 group-hover:animate-pulse" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Store Notifications</h2>
                  <div className="space-y-3">
                    {[
                      { icon: Bell, title: 'Push Alerts', desc: 'Real-time updates on orders' },
                      { icon: Shield, title: 'Two-Factor Auth', desc: 'Secure your login attempts', action: 'Enable' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-purple-600 shadow-sm">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                          </div>
                        </div>
                        {item.action ? (
                          <button
                            onClick={() => toast.success("Feature enabled")}
                            className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50"
                          >
                            {item.action}
                          </button>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
