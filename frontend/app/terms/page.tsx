"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { FileText, ShoppingCart, CreditCard, AlertCircle, UserX, Scale } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function TermsOfServicePage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: "By accessing and using LuxeStore, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the site constitutes acceptance of those changes."
    },
    {
      icon: ShoppingCart,
      title: "Use of Service",
      content: "You agree to use our service only for lawful purposes and in accordance with these Terms. You must not use our service in any way that could damage, disable, overburden, or impair our servers or networks, or interfere with any other party's use of our service. You must be at least 18 years old to make purchases."
    },
    {
      icon: CreditCard,
      title: "Orders and Payment",
      content: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payment must be received before your order is processed. We accept major credit cards, debit cards, and other payment methods as displayed on our site."
    },
    {
      icon: AlertCircle,
      title: "Returns and Refunds",
      content: "We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Refunds will be processed to the original payment method within 5-10 business days after we receive your return. Shipping costs are non-refundable unless the return is due to our error."
    },
    {
      icon: UserX,
      title: "Account Termination",
      content: "We reserve the right to terminate or suspend your account and access to our service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will cease immediately."
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: "LuxeStore shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability shall not exceed the amount you paid for the product or service in question."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Please read these terms carefully before using our services. By using LuxeStore, you agree to these terms.
          </p>
          <p className="text-sm text-blue-200 mt-4">Last Updated: December 12, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-purple-900/30' : 'bg-gradient-to-br from-purple-100 to-blue-100'}`}>
                  <section.icon className="w-7 h-7 text-purple-600" />
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
            Questions About Our Terms?
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            If you have any questions about these Terms of Service, please don't hesitate to reach out.
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

