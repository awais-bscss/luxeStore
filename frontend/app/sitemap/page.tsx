"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import {
  Map,
  Home,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  FileText,
  Mail,
  Info,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";

export default function SitemapPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const sitemapSections = [
    {
      icon: Home,
      title: "Main Pages",
      links: [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" }
      ]
    },
    {
      icon: ShoppingBag,
      title: "Shopping",
      links: [
        { name: "All Products", href: "/products" },
        { name: "Electronics", href: "/products?category=Electronics" },
        { name: "Fashion", href: "/products?category=Fashion" },
        { name: "Wearables", href: "/products?category=Wearables" },
        { name: "Home & Living", href: "/products?category=Home" }
      ]
    },
    {
      icon: User,
      title: "Account",
      links: [
        { name: "My Account", href: "/account" },
        { name: "Favorites", href: "/favorites" },
        { name: "Shopping Cart", href: "/cart" },
        { name: "Checkout", href: "/checkout" }
      ]
    },
    {
      icon: Info,
      title: "Information",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact Us", href: "/contact" },
        { name: "Help Center", href: "/help" },
        { name: "Track Order", href: "/track" },
        { name: "Shipping Info", href: "/shipping" },
        { name: "Returns", href: "/returns" }
      ]
    },
    {
      icon: FileText,
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Accessibility", href: "/accessibility" }
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Sitemap</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Navigate through all pages and sections of LuxeStore. Find exactly what you're looking for.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Introduction */}
        <div className={`rounded-2xl shadow-lg p-8 mb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Our Sitemap
          </h2>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This sitemap provides an overview of all the pages available on LuxeStore.
            Use it to quickly navigate to any section of our website or to discover new features and content.
          </p>
        </div>

        {/* Sitemap Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitemapSections.map((section, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <section.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 group ${isDarkMode
                          ? 'hover:bg-gray-700 text-gray-300 hover:text-blue-400'
                          : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      <span className="text-sm font-medium">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {sitemapSections.reduce((total, section) => total + section.links.length, 0)}
            </div>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Pages
            </div>
          </div>
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {sitemapSections.length}
            </div>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Categories
            </div>
          </div>
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Available
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className={`mt-12 rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Mail className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Can't Find What You're Looking For?
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            If you can't find the page you're looking for, please contact us and we'll be happy to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

