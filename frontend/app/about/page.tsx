"use client";

// IMPORTS
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { CartSidebar } from "../../components/cart/CartSidebar";
import { Award, Users, Target, Heart, Shield, Zap } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// COMPONENT
export default function AboutPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const values = [
    {
      icon: Award,
      title: "Quality First",
      description: "We source only the finest products from trusted brands worldwide."
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Your satisfaction is our top priority. We're here to help 24/7."
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Constantly evolving to bring you the latest and greatest products."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We love what we do and it shows in every product we offer."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Secure shopping with buyer protection and easy returns."
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get your products to you faster."
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Products" },
    { number: "50+", label: "Brands" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      {/* Navbar */}
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About LuxeStore</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Your trusted destination for premium products and exceptional shopping experiences since 2020.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`rounded-2xl shadow-xl p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className={`font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Story</h2>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Founded in 2020, LuxeStore began with a simple mission: to make premium products accessible to everyone. What started as a small online shop has grown into a trusted marketplace serving thousands of customers worldwide.
            </p>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We carefully curate our product selection, working directly with manufacturers and brands to ensure authenticity and quality. Every item in our store meets our rigorous standards for excellence.
            </p>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Today, we're proud to offer a diverse range of products across multiple categories, all backed by our commitment to customer satisfaction and exceptional service.
            </p>
          </div>
          <div className={`rounded-3xl p-12 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Award Winning Service</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Recognized for excellence in e-commerce and customer satisfaction
            </p>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className={`py-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Values</h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className={`p-8 rounded-2xl border hover:shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100'}`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value.title}</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the LuxeStore difference. Shop with confidence and discover why thousands of customers trust us for their shopping needs.
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            Start Shopping
          </a>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

