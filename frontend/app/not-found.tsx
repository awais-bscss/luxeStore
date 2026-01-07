"use client";

import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft, ShoppingBag, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-2">
              404
            </h1>
            <p className="text-red-100 text-lg">
              Page Not Found
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Message */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Oops! Page Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                Here's what you can do:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-blue-800 dark:text-blue-300 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Check the URL for typos</span>
                </li>
                <li className="flex items-start gap-3 text-blue-800 dark:text-blue-300 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Go back to the previous page</span>
                </li>
                <li className="flex items-start gap-3 text-blue-800 dark:text-blue-300 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Visit our homepage to start fresh</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home Page
              </Link>
            </div>

            {/* Search Suggestion */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Looking for something specific?
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Browse All Products
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Error Code: 404 - Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
}
