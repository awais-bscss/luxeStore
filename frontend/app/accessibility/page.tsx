"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { CartSidebar } from "../../components/cart/CartSidebar";
import {
  Accessibility,
  Eye,
  Keyboard,
  Volume2,
  MousePointer,
  Monitor,
  Smartphone,
  Type,
  Contrast
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function AccessibilityPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const features = [
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description: "Our website is fully navigable using only a keyboard. Use Tab to move forward, Shift+Tab to move backward, Enter to select, and Escape to close modals."
    },
    {
      icon: Eye,
      title: "Screen Reader Support",
      description: "We use semantic HTML and ARIA labels to ensure compatibility with screen readers like JAWS, NVDA, and VoiceOver. All images have descriptive alt text."
    },
    {
      icon: Contrast,
      title: "Dark Mode",
      description: "Toggle between light and dark themes using the sun/moon icon in the navigation bar. Dark mode reduces eye strain and improves readability in low-light conditions."
    },
    {
      icon: Type,
      title: "Readable Typography",
      description: "We use clear, legible fonts with appropriate sizing and spacing. Text maintains a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text."
    },
    {
      icon: MousePointer,
      title: "Click Targets",
      description: "All interactive elements are sized appropriately (minimum 44x44 pixels) to ensure they're easy to click or tap, even for users with motor impairments."
    },
    {
      icon: Monitor,
      title: "Responsive Design",
      description: "Our website adapts to different screen sizes and orientations, ensuring a consistent experience across desktop, tablet, and mobile devices."
    },
    {
      icon: Volume2,
      title: "No Auto-Play Media",
      description: "We don't auto-play audio or video content. All media can be controlled by the user, with clear play/pause buttons and volume controls."
    },
    {
      icon: Smartphone,
      title: "Mobile Accessibility",
      description: "Touch targets are appropriately sized, and gestures are simple and intuitive. The site works well with mobile screen readers and assistive technologies."
    }
  ];

  const guidelines = [
    {
      title: "WCAG 2.1 Compliance",
      description: "We strive to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to ensure our website is accessible to all users."
    },
    {
      title: "Continuous Improvement",
      description: "We regularly test our website with various assistive technologies and make improvements based on user feedback and accessibility audits."
    },
    {
      title: "Third-Party Content",
      description: "While we ensure our own content is accessible, some third-party embedded content may not meet the same standards. We're working with our partners to improve this."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Accessibility className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Accessibility Statement</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're committed to ensuring our website is accessible to everyone, including people with disabilities.
          </p>
          <p className="text-sm text-blue-200 mt-4">Last Updated: December 12, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Our Commitment */}
        <div className={`rounded-2xl shadow-lg p-8 mb-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Commitment
          </h2>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            At LuxeStore, we believe that everyone should have equal access to our products and services.
            We're dedicated to providing an inclusive shopping experience and continuously work to improve
            the accessibility of our website for all users, regardless of their abilities or the technologies they use.
          </p>
        </div>

        {/* Accessibility Features */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Accessibility Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Standards & Guidelines
          </h2>
          <div className="space-y-6">
            {guidelines.map((guideline, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {guideline.title}
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {guideline.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Help Us Improve
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            If you encounter any accessibility barriers on our website or have suggestions for improvement,
            please let us know. Your feedback helps us create a better experience for everyone.
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

