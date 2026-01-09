"use client";

import React from "react";
import {
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Heart,
  CreditCard,
  Shield,
  Truck
} from "lucide-react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/" },
      { name: "Electronics", href: "/?category=Electronics" },
      { name: "Fashion", href: "/?category=Fashion" },
      { name: "Wearables", href: "/?category=Wearables" },
      { name: "Home & Living", href: "/?category=Home" },
      { name: "New Arrivals", href: "/?sort=new" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Affiliates", href: "/affiliates" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Track Order", href: "/track" },
      { name: "Track Application", href: "/track-application" },
      { name: "Returns", href: "/returns" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Size Guide", href: "/size-guide" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Accessibility", href: "/accessibility" },
      { name: "Sitemap", href: "/sitemap" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-500" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/awais-bscs/", label: "LinkedIn", color: "hover:text-blue-700" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hover:text-red-600" },
  ];

  const trustBadges = [
    { icon: Shield, text: "Secure Payment" },
    { icon: Truck, text: "Free Shipping" },
    { icon: CreditCard, text: "Easy Returns" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <badge.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-white">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-400">
                Get exclusive deals, new arrivals, and insider updates delivered to your inbox.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/logo.png"
                  alt="LuxeStore Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                LuxeStore
              </h2>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your destination for premium products and exceptional shopping experiences.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span> Clock Tower, Faisalabad</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+92 308 9389774</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>awais@luxestore.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="relative inline-block text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} LuxeStore. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by LuxeStore Team
              </span>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">We accept:</span>
              <div className="flex gap-2">
                {["VISA", "MC", "AMEX", "PP"].map((method, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 px-3 py-1 rounded text-xs font-bold text-gray-400 border border-gray-700"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
