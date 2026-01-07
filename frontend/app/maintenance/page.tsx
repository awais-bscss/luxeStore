"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Settings, RefreshCw, Home, Mail, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MaintenancePage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(false);

  // Check if user is admin - they should bypass maintenance
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      router.push('/');
    }
  }, [user, router]);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();

      if (data.success && !data.data.settings.maintenanceMode) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Under Maintenance
            </h1>
            <p className="text-blue-100">
              We're currently performing scheduled maintenance
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Status Alert */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                    Temporary Downtime
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Our team is working to improve your experience. We'll be back online shortly.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Happening */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                What's Happening?
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>System upgrades and performance improvements</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Security updates and bug fixes</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>New features coming soon</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Status'}
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </div>

            {/* Contact */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Need immediate assistance?
              </p>
              <a
                href="mailto:support@luxestore.com"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@luxestore.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for your patience
          </p>
        </div>
      </div>
    </div>
  );
}
