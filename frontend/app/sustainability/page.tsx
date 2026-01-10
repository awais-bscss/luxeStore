"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import {
  Leaf,
  Recycle,
  Package,
  Truck,
  Heart,
  Award,
  Target,
  TrendingDown,
  Users,
  Globe,
  CheckCircle
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function SustainabilityPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const commitments = [
    {
      icon: Recycle,
      title: "100% Recyclable Packaging",
      description: "All our packaging materials are fully recyclable and made from sustainable sources",
      stat: "100%"
    },
    {
      icon: TrendingDown,
      title: "Carbon Neutral Shipping",
      description: "We offset 100% of our shipping emissions through verified carbon offset programs",
      stat: "0 Net Carbon"
    },
    {
      icon: Package,
      title: "Sustainable Products",
      description: "Over 60% of our product catalog meets strict environmental standards",
      stat: "60%+"
    },
    {
      icon: Truck,
      title: "Eco-Friendly Delivery",
      description: "Partnering with carriers using electric vehicles and optimized routes",
      stat: "50% Electric"
    }
  ];

  const initiatives = [
    {
      icon: Leaf,
      title: "Green Warehousing",
      description: "Our warehouses run on 100% renewable energy with solar panels and energy-efficient systems. We've reduced energy consumption by 40% through smart automation and LED lighting.",
      impact: "40% Energy Reduction"
    },
    {
      icon: Package,
      title: "Minimal Packaging",
      description: "We've redesigned our packaging to use 30% less material while maintaining product protection. All packaging is plastic-free and biodegradable.",
      impact: "30% Less Material"
    },
    {
      icon: Recycle,
      title: "Circular Economy",
      description: "Our product take-back program allows customers to return used items for recycling or refurbishment, keeping products out of landfills.",
      impact: "10,000+ Items Recycled"
    },
    {
      icon: Users,
      title: "Ethical Sourcing",
      description: "We partner only with suppliers who meet our strict environmental and social responsibility standards, ensuring fair labor practices.",
      impact: "100% Certified Suppliers"
    },
    {
      icon: Globe,
      title: "Community Impact",
      description: "We donate 1% of all sales to environmental conservation projects and plant a tree for every order placed.",
      impact: "50,000+ Trees Planted"
    },
    {
      icon: Award,
      title: "Certifications",
      description: "We maintain certifications from leading environmental organizations and continuously work to improve our sustainability practices.",
      impact: "5 Major Certifications"
    }
  ];

  const goals = [
    { year: "2024", goal: "Achieve 100% renewable energy in all facilities", status: "In Progress" },
    { year: "2025", goal: "Reduce carbon footprint by 50%", status: "On Track" },
    { year: "2026", goal: "100% sustainable product packaging", status: "Planned" },
    { year: "2030", goal: "Become completely carbon neutral", status: "Committed" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Commitment to Sustainability</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Building a better future through responsible business practices and environmental stewardship
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Mission Statement */}
        <div className={`rounded-2xl shadow-lg p-8 mb-16 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Heart className={`w-16 h-16 mx-auto mb-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Mission
          </h2>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            At LuxeStore, we believe that business success and environmental responsibility go hand in hand.
            We're committed to minimizing our environmental impact while delivering exceptional products and
            services to our customers. Every decision we make considers its effect on our planet and future generations.
          </p>
        </div>

        {/* Key Commitments */}
        <div className="mb-16">
          <h2 className={`text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Commitments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commitments.map((commitment, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-green-900/30' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                  <commitment.icon className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {commitment.stat}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {commitment.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {commitment.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Initiatives */}
        <div className="mb-16">
          <h2 className={`text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Initiatives
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {initiatives.map((initiative, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                    <initiative.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {initiative.title}
                    </h3>
                    <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {initiative.description}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      <CheckCircle className="w-4 h-4" />
                      {initiative.impact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Timeline */}
        <div className={`rounded-2xl shadow-lg p-8 mb-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Sustainability Goals
          </h2>
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                  <span className="text-2xl font-bold text-green-600">{goal.year}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {goal.goal}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${goal.status === "In Progress" ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800' :
                      goal.status === "On Track" ? isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800' :
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Target className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Join Us in Making a Difference
          </h3>
          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Every purchase you make supports our sustainability initiatives. Together, we can create a better future.
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Shop Sustainable Products
          </a>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

