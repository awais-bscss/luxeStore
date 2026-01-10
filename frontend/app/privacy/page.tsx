"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function PrivacyPolicyPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, including your name, email address, postal address, phone number, and payment information when you make a purchase, create an account, or contact us. We also automatically collect certain information about your device when you use our website, including your IP address, browser type, and browsing behavior."
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: "We use the information we collect to process your orders, communicate with you about your purchases, send you marketing communications (with your consent), improve our website and services, prevent fraud and enhance security, and comply with legal obligations."
    },
    {
      icon: Lock,
      title: "Information Sharing",
      content: "We do not sell your personal information. We may share your information with service providers who help us operate our business, such as payment processors, shipping companies, and marketing platforms. We may also share information when required by law or to protect our rights and safety."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data, and request data portability. To exercise these rights, please contact us at privacy@luxestore.com."
    },
    {
      icon: FileText,
      title: "Updates to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date. We encourage you to review this policy periodically."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <section.icon className="w-7 h-7 text-blue-600" />
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
            Questions About Privacy?
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            If you have any questions or concerns about our privacy practices, please contact us.
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

