"use client";

// IMPORTS
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import { addToast } from "@/store/slices/toastSlice";
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  Package,
  Heart,
  User,
  Phone,
  Info,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Settings as SettingsIcon
} from "lucide-react";
import { AuthModal } from "../auth/AuthModal";
import { useTheme } from "../../contexts/ThemeContext";

// TYPES
interface NavbarProps {
  cartItemCount?: number;
  onCartOpen: () => void;
}

// COMPONENT
export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const cartItemCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const favoritesCount = useAppSelector((state: RootState) => state.favorites.items.length);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const shopCategories = [
    { name: "All Products", href: "/products" },
    { name: "Electronics", href: "/products?category=Electronics" },
    { name: "Fashion", href: "/products?category=Fashion" },
    { name: "Wearables", href: "/products?category=Wearables" },
    { name: "Home & Living", href: "/products?category=Home" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShopDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 150);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(addToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been successfully logged out.'
    }));
    setUserMenuOpen(false);

    // Refetch products to ensure they're visible after logout
    await dispatch(fetchProducts() as any);

    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Navigate to home page
    router.push('/');
  };



  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling on body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll position when menu closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-2 sm:py-2.5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold animate-pulse">
              🔥 HOT DEAL
            </span>
            <span className="hidden sm:inline">
              Limited Time Offer: Get <span className="font-bold text-yellow-300">50% OFF</span> on all products!
            </span>
            <span className="sm:hidden">
              <span className="font-bold text-yellow-300">50% OFF</span> Everything!
            </span>
            <span className="hidden md:inline bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">
              ⏰ Ends in 2 days
            </span>
            <a
              href="/products"
              className="bg-white text-red-600 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs font-bold hover:bg-yellow-300 hover:text-red-700 transition-all duration-300 shadow-lg"
            >
              Shop Now →
            </a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${isDarkMode
        ? 'bg-gray-900/95 border-gray-700'
        : 'bg-white/95 border-gray-200'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="LuxeStore Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LuxeStore
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Premium Shopping</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative flex items-center gap-2 px-2 py-2 font-semibold transition-colors duration-300 group"
                  >
                    <Icon className={`w-4 h-4 transition-colors duration-300 ${active ? "text-blue-600" : isDarkMode ? "text-gray-300 group-hover:text-blue-400" : "text-gray-700 group-hover:text-blue-600"
                      }`} />
                    <span className={`transition-colors duration-300 ${active ? "text-blue-600" : isDarkMode ? "text-gray-300 group-hover:text-blue-400" : "text-gray-700 group-hover:text-blue-600"
                      }`}>
                      {link.name}
                    </span>
                    {/* Animated Underline */}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"
                      }`}></span>
                  </Link>
                );
              })}

              <div
                className="relative group"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className={`relative flex items-center gap-2 px-2 py-2 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}>
                  <Package className="w-4 h-4 transition-colors duration-300" />
                  Shop
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${shopDropdownOpen ? "rotate-180" : ""}`} />
                  {/* Animated Underline */}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${shopDropdownOpen ? "w-full" : "w-0 group-hover:w-full"
                    }`}></span>
                </button>

                {/* Dropdown Menu */}
                {shopDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1 w-56 z-50">
                    <div className={`rounded-xl shadow-xl border py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      {shopCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className={`block px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">

              {/* Favorites */}
              <Link
                href="/favorites"
                className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-300 relative ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 relative overflow-hidden group cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                aria-label="Toggle dark mode"
              >
                {/* Sun Icon */}
                <Sun className={`w-5 h-5 absolute transition-all duration-500 ${isDarkMode
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
                  }`} />
                {/* Moon Icon */}
                <Moon className={`w-5 h-5 absolute transition-all duration-500 ${isDarkMode
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
                  }`} />
              </button>

              {/* User Menu / Login Button */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-2 z-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${(user.role === 'admin' || user.role === 'superadmin') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                        </div>

                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>

                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                          >
                            <SettingsIcon className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-2 px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthDropdownOpen(true)}
                  className={`hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Login</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={onCartOpen}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t animate-in fade-in slide-in-from-top-4 duration-300 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="relative flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-300 group overflow-hidden"
                    >
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"
                        }`} />
                      <span className={`transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"
                        }`}>
                        {link.name}
                      </span>
                      {/* Animated Underline */}
                      <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${active ? "w-[calc(100%-2rem)]" : "w-0 group-hover:w-[calc(100%-2rem)]"
                        }`}></span>
                    </Link>
                  );
                })}

                {/* Shop Categories */}
                <div className="mt-2 pt-2 border-t">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Shop by Category</p>
                  {shopCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="mt-2 pt-2 border-t flex flex-col gap-2">
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Heart className="w-5 h-5" />
                    Favorites
                  </Link>

                  {/* Theme Toggle Mobile */}
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors duration-300 relative overflow-hidden cursor-pointer"
                  >
                    <div className="relative w-5 h-5">
                      {/* Sun Icon */}
                      <Sun className={`w-5 h-5 absolute transition-all duration-500 ${isDarkMode
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                        }`} />
                      {/* Moon Icon */}
                      <Moon className={`w-5 h-5 absolute transition-all duration-500 ${isDarkMode
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                        }`} />
                    </div>
                    <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  {isAuthenticated && user ? (
                    <>
                      <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${(user.role === 'admin' || user.role === 'superadmin') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </div>

                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-md"
                      >
                        <Package className="w-5 h-5" />
                        My Orders
                      </Link>

                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md"
                        >
                          <SettingsIcon className="w-5 h-5" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthDropdownOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md"
                    >
                      <User className="w-5 h-5" />
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authDropdownOpen}
        onClose={() => setAuthDropdownOpen(false)}
      />
    </>
  );
};

