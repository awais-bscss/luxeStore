"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { RotateCcw, Package, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ReturnsPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const returnSteps = [
    { icon: Package, title: "Initiate Return", description: "Log into your account and select the item you want to return" },
    { icon: CheckCircle, title: "Get Return Label", description: "Print your prepaid return shipping label" },
    { icon: RotateCcw, title: "Pack & Ship", description: "Pack the item securely and drop it off at any carrier location" },
    { icon: Clock, title: "Processing", description: "We'll inspect your return within 3-5 business days" },
    { icon: CheckCircle, title: "Refund Issued", description: "Refund will be processed to your original payment method" }
  ];

  const eligibleItems = [
    { icon: CheckCircle, text: "Unused items in original packaging", eligible: true },
    { icon: CheckCircle, text: "Items with tags still attached", eligible: true },
    { icon: CheckCircle, text: "Returns within 30 days of delivery", eligible: true },
    { icon: XCircle, text: "Final sale or clearance items", eligible: false },
    { icon: XCircle, text: "Personalized or custom items", eligible: false },
    { icon: XCircle, text: "Items without original packaging", eligible: false }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Returns & Refunds</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We offer a hassle-free 30-day return policy. Your satisfaction is our priority.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className={`rounded-2xl shadow-lg p-8 mb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Return Process</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Eligible for Return</h3>
            <div className="space-y-4">
              {eligibleItems.filter(item => item.eligible).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Not Eligible</h3>
            <div className="space-y-4">
              {eligibleItems.filter(item => !item.eligible).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Need Help with a Return?</h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Our customer service team is here to assist you with your return.
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

