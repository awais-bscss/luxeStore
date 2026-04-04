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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-500">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Profile Section */}
      <div className="relative bg-[#0F172A] pt-32 pb-48 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-pink-500 p-[3px] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full rounded-[2.4rem] bg-[#1E293B] flex items-center justify-center overflow-hidden border-4 border-[#0F172A]">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-20 h-20 text-white/50" />
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-gray-800 text-purple-600 rounded-2xl shadow-xl hover:scale-110 transition-all border border-gray-100 dark:border-gray-700">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                  {user?.name || "Guest User"}
                </h1>
                <span className="px-5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-pink-400 uppercase tracking-widest border border-white/10">
                  {user?.role || "Member"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink-500" />
                  <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 pb-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 border border-white/20 dark:border-gray-700/50 sticky top-24">
              <div className="mb-8 px-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Main Navigation</p>
                <nav className="space-y-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-500 group ${isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          }`}
                      >
                        <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-white" : "text-purple-500"}`} />
                        <span>{tab.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 px-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Orders', value: '12', icon: Package, color: 'purple', sub: 'Completed' },
                    { label: 'Favorites', value: '24', icon: Heart, color: 'pink', sub: 'In Wishlist' },
                    { label: 'Total Spent', value: formatPrice(2450.00, settings.currency, settings.usdToPkrRate), icon: ShoppingCart, color: 'blue', sub: 'Lifetime' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-50 dark:border-gray-700 group hover:scale-[1.02] transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600`}>
                          <stat.icon className="w-8 h-8" />
                        </div>
                        <span className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{stat.value}</span>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className={`text-xs font-bold text-${stat.color}-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Personal Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-50 dark:border-gray-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 relative z-10">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Personal Identity</h2>
                      <p className="text-gray-400 font-medium">Your public and private account information</p>
                    </div>
                    <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none hover:scale-105 active:scale-95">
                      <Edit2 className="w-5 h-5" />
                      Modify Profile
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    {[
                      { icon: User, label: 'Legal Name', value: user?.name, color: 'text-purple-600' },
                      { icon: Mail, label: 'Communication Hub', value: user?.email, color: 'text-pink-600' }
                    ].map((field, i) => (
                      <div key={i} className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border border-transparent hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-500 group">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-sm transform group-hover:rotate-12 transition-transform">
                            <field.icon className={`w-6 h-6 ${field.color}`} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{field.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{field.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-50 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Acquisition Path</h2>
                  <div className="flex items-center gap-2 text-purple-600 font-bold bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
                    <Package className="w-5 h-5" />
                    <span>{recentOrders.length} Recent Transactions</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 border border-transparent hover:border-purple-100 dark:hover:border-purple-900 group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-purple-600 transition-colors duration-500">
                            <ShoppingCart className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{order.id}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.date}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${order.status === "Delivered" ? "bg-green-100/50 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                          order.status === "Shipped" ? "bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" :
                            "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">{order.items} Exclusive Artifacts</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(order.total, settings.currency, settings.usdToPkrRate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-16 border border-gray-50 dark:border-gray-700 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 transform rotate-12">
                  <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Your Heart is Empty</h2>
                <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">It seems you haven't discovered your must-have pieces yet. Explore our latest drops and curate your collection.</p>
                <button 
                  onClick={() => router.push('/products')}
                  className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-purple-500/40 dark:shadow-none inline-flex items-center gap-3"
                >
                  Explore Showcase <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {isPasswordExpired && (
                  <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 p-10 rounded-[2rem] flex items-start gap-8 animate-pulse">
                    <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg transform -rotate-6">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-red-600 dark:text-red-400 font-black text-2xl mb-2 uppercase tracking-tighter underline decoration-2 underline-offset-4">Security Policy Override</h3>
                      <p className="text-red-600 dark:text-red-300 font-medium leading-relaxed max-w-2xl">To safeguard your luxury assets, a mandatory cryptographic update is required. Your current passphrase has exceeded the valid timeframe.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-50 dark:border-gray-700">
                  <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Key className="w-6 h-6 text-purple-600" /></div>
                        Cryptographic Key
                      </h2>
                      <p className="text-gray-400 font-medium mt-1">Update your password sequence</p>
                    </div>
                    <div className="hidden sm:block">
                       <Shield className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                    </div>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                    <div className="relative group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Current Passphrase</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50 group-focus-within:text-purple-600 transition-colors" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          placeholder="Verify Identity"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-16 pr-16 py-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-purple-500/30 dark:focus:border-purple-600/30 rounded-2xl outline-none transition-all dark:text-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">New Sequence</label>
                        <div className="relative">
                          <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50 group-focus-within:text-purple-600 transition-colors" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="Min 6 characters"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-16 pr-16 py-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-purple-500/30 dark:focus:border-purple-600/30 rounded-2xl outline-none transition-all dark:text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Confirm Sequence</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50 group-focus-within:text-purple-600 transition-colors" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Repeat sequence"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full pl-16 pr-16 py-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-purple-500/30 dark:focus:border-purple-600/30 rounded-2xl outline-none transition-all dark:text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] text-xs py-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-purple-500/40 dark:shadow-none flex items-center justify-center gap-4 group"
                      >
                        {isChangingPassword ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>
                            <Shield className="w-5 h-5 group-hover:animate-bounce" />
                            Update Cryptographic Matrix
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-50 dark:border-gray-700">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg"><Bell className="w-6 h-6 text-pink-600" /></div>
                      Communication Array
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: Bell, title: 'Neural Notifications', desc: 'Order status & exclusive drops via push', color: 'purple' },
                      { icon: Shield, title: 'Multi-Factor Shield', desc: 'Biometric & SMS verification layers', color: 'pink', action: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-transparent hover:border-purple-500/10 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className={`p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-${item.color}-500 transform group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">{item.desc}</p>
                          </div>
                        </div>
                        {item.action ? (
                          <button
                            onClick={() => toast.success("Shield Active", "Biometric layers deployed")}
                            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-purple-600 hover:text-white transition-all"
                          >
                            Deploy
                          </button>
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer group">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
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
