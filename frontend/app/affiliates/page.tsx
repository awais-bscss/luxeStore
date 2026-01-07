"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import {
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  BarChart,
  Zap,
  CheckCircle,
  Star,
  Award,
  Target,
  Link as LinkIcon,
  Percent
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getCurrencySymbol } from "../../lib/currency";
import { useSettings } from "../../contexts/SettingsContext";

export default function AffiliatesPage() {
  const { isDarkMode } = useTheme();
  const { settings } = useSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const benefits = [
    {
      icon: DollarSign,
      title: "Generous Commissions",
      description: "Earn up to 15% commission on every sale you refer",
      highlight: "Up to 15%"
    },
    {
      icon: TrendingUp,
      title: "Recurring Income",
      description: "Earn commissions on repeat purchases from your referrals",
      highlight: "Lifetime Earnings"
    },
    {
      icon: BarChart,
      title: "Real-Time Analytics",
      description: "Track your performance with our advanced dashboard",
      highlight: "Live Tracking"
    },
    {
      icon: Gift,
      title: "Exclusive Bonuses",
      description: "Unlock special rewards and bonuses as you grow",
      highlight: "Extra Rewards"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up",
      description: "Join our affiliate program for free in just a few minutes",
      icon: Users
    },
    {
      step: "2",
      title: "Get Your Link",
      description: "Receive your unique affiliate tracking link and marketing materials",
      icon: LinkIcon
    },
    {
      step: "3",
      title: "Share & Promote",
      description: "Share your link on social media, blogs, or websites",
      icon: Zap
    },
    {
      step: "4",
      title: "Earn Commissions",
      description: "Get paid for every sale made through your affiliate link",
      icon: DollarSign
    }
  ];

  const commissionTiers = [
    {
      tier: "Starter",
      sales: "0-50 sales/month",
      commission: "10%",
      perks: ["Basic dashboard", "Email support", "Marketing materials"]
    },
    {
      tier: "Pro",
      sales: "51-200 sales/month",
      commission: "12%",
      perks: ["Advanced analytics", "Priority support", "Exclusive promotions", "Custom banners"],
      featured: true
    },
    {
      tier: "Elite",
      sales: "200+ sales/month",
      commission: "15%",
      perks: ["Dedicated account manager", "Early product access", "Custom commission deals", "VIP support", "Featured placement"]
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Active Affiliates" },
    { icon: DollarSign, value: `${getCurrencySymbol(settings.currency)}2M+`, label: "Paid in Commissions" },
    { icon: TrendingUp, value: "25%", label: "Avg. Conversion Rate" },
    { icon: Award, value: "4.9/5", label: "Affiliate Satisfaction" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Join Our Affiliate Program</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Turn your audience into income. Earn generous commissions by promoting products you love.
          </p>
          <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Join Now - It's Free!
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
                <stat.icon className="w-7 h-7 text-purple-600" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className={`text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why Join Our Program?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
                  <benefit.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {benefit.highlight}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {benefit.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className={`rounded-2xl shadow-lg p-8 mb-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {item.step}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="mb-16">
          <h2 className={`text-4xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Commission Tiers
          </h2>
          <p className={`text-center mb-12 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The more you sell, the more you earn
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {commissionTiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-8 transition-all duration-300 ${tier.featured
                  ? 'ring-4 ring-purple-600 transform scale-105'
                  : ''
                  } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                {tier.featured && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tier.tier}
                </h3>
                <p className={`text-center mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tier.sales}
                </p>
                <div className="text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  {tier.commission}
                </div>
                <ul className="space-y-3">
                  {tier.perks.map((perk, perkIndex) => (
                    <li key={perkIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Target className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Start Earning?
          </h3>
          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of successful affiliates and start earning commissions today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Apply Now
            </button>
            <a
              href="/contact"
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

