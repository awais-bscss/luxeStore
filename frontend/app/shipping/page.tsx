"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { Truck, Package, Globe, Clock, DollarSign, MapPin } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { formatPrice } from "../../lib/currency";
import { useSettings } from "../../contexts/SettingsContext";

export default function ShippingPage() {
  const { isDarkMode } = useTheme();
  const { settings } = useSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const shippingOptions = [
    {
      icon: Truck,
      name: "Standard Shipping",
      time: "5-7 Business Days",
      cost: `FREE on orders over ${formatPrice(100, settings.currency, settings.usdToPkrRate)}`,
      description: "Reliable delivery at no extra cost for qualifying orders"
    },
    {
      icon: Package,
      name: "Express Shipping",
      time: "2-3 Business Days",
      cost: formatPrice(15.99, settings.currency, settings.usdToPkrRate),
      description: "Faster delivery for when you need it sooner"
    },
    {
      icon: Clock,
      name: "Next Day Delivery",
      time: "1 Business Day",
      cost: formatPrice(29.99, settings.currency, settings.usdToPkrRate),
      description: "Get your order tomorrow (order by 2 PM)"
    },
    {
      icon: Globe,
      name: "International Shipping",
      time: "10-15 Business Days",
      cost: "Varies by location",
      description: "We ship to over 50 countries worldwide"
    }
  ];

  const faqs = [
    {
      question: "Do you offer free shipping?",
      answer: `Yes! We offer free standard shipping on all orders over ${formatPrice(100, settings.currency, settings.usdToPkrRate)} within the continental United States.`
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order on our Track Order page."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries. International shipping costs and delivery times vary by destination."
    },
    {
      question: "What if my package is lost or damaged?",
      answer: "All shipments are insured. If your package is lost or arrives damaged, please contact us immediately and we'll resolve the issue."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Shipping Information</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Fast, reliable shipping to get your orders to you quickly and safely
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <option.icon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {option.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {option.time}
                    </span>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {option.cost}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl shadow-lg p-8 mb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {faq.question}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <MapPin className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Track Your Order
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Want to know where your package is? Track it in real-time.
          </p>
          <a
            href="/track"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Track Order
          </a>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

