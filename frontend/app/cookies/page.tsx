"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { Cookie, Settings, BarChart, Target, Shield, CheckCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function CookiePolicyPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cookieTypes = [
    {
      icon: CheckCircle,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality.",
      required: true
    },
    {
      icon: BarChart,
      title: "Analytics Cookies",
      description: "We use these cookies to understand how visitors interact with our website. This helps us improve our site and provide a better user experience.",
      required: false
    },
    {
      icon: Target,
      title: "Marketing Cookies",
      description: "These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.",
      required: false
    },
    {
      icon: Settings,
      title: "Functional Cookies",
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.",
      required: false
    }
  ];

  const sections = [
    {
      icon: Cookie,
      title: "What Are Cookies?",
      content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site. Cookies help us understand how you use our site and improve your experience."
    },
    {
      icon: Shield,
      title: "How We Use Cookies",
      content: "We use cookies to remember your preferences, understand how you use our website, improve our services, deliver personalized content and advertisements, analyze site traffic and usage patterns, and ensure the security of our website and protect against fraud."
    },
    {
      icon: Settings,
      title: "Managing Cookies",
      content: "Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience on our website and prevent you from enjoying all of its features. You can delete cookies at any time, but you may lose any information that enables you to access the website more quickly."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Learn about how we use cookies to improve your experience on LuxeStore.
          </p>
          <p className="text-sm text-blue-200 mt-4">Last Updated: December 12, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Cookie Types */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Types of Cookies We Use
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cookieTypes.map((cookie, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-gradient-to-br from-green-100 to-blue-100'}`}>
                    <cookie.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {cookie.title}
                      </h3>
                      {cookie.required && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {cookie.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Information Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-orange-900/30' : 'bg-gradient-to-br from-orange-100 to-yellow-100'}`}>
                  <section.icon className="w-7 h-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </h2>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className={`mt-12 rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Questions About Cookies?
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            If you have any questions about our use of cookies, please contact us.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Us
          </a>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

