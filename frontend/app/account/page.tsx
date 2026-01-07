"use client";

// IMPORTS
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { RootState } from "../../store/store";
import { useToast } from "../../hooks/useToast";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, Edit2, Shield, Bell, Key, AlertTriangle, Loader2 } from "lucide-react";
import { formatPrice } from "../../lib/currency";
import { useSettings } from "../../contexts/SettingsContext";
import { logout } from "../../store/slices/authSlice";

// COMPONENT
export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { settings } = useSettings();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user, isPasswordExpired } = useSelector((state: any) => state.auth);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const toast = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

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
      } else {
        toast.error("Error", data.message || "Failed to change password");
      }
    } catch (err) {
      toast.error("Error", "An error occurred while changing password");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{user?.name || "Guest User"}</h1>
              <p className="text-xl text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-8 h-8 text-blue-600" />
                      <span className="text-3xl font-bold text-gray-900">12</span>
                    </div>
                    <p className="text-gray-600 font-medium">Total Orders</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-8 h-8 text-red-500" />
                      <span className="text-3xl font-bold text-gray-900">24</span>
                    </div>
                    <p className="text-gray-600 font-medium">Favorites</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">💰</span>
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(2450.00, settings.currency, settings.usdToPkrRate)}</span>
                    </div>
                    <p className="text-gray-600 font-medium">Total Spent</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <User className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email Address</p>
                        <p className="font-semibold text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === "Delivered" ? "bg-green-100 text-green-700" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">{order.items} items</p>
                        <p className="font-bold text-gray-900 text-lg">{formatPrice(order.total, settings.currency, settings.usdToPkrRate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Products</h2>
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No favorites yet</p>
                  <p className="text-gray-500 mt-2">Start adding products to your favorites!</p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {isPasswordExpired && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-4 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-red-800 font-bold">Password Expired</h3>
                      <p className="text-red-700 text-sm">To ensure the security of your account, you must change your password before you can continue using the store.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Key className="w-6 h-6 text-blue-600" />
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates about your orders</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.success("Enabled!", "Two-factor authentication has been enabled")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
