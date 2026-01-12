"use client";

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useRedux';

export default function AuthDebugPage() {
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Auth Debug Info
        </h1>

        <div className="space-y-6">
          {/* Redux State */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Redux Auth State
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">isAuthenticated:</span>{' '}
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? 'true' : 'false'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">User:</span>{' '}
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Token (first 50 chars):</span>{' '}
                <span className="text-blue-600 dark:text-blue-400 break-all">
                  {token ? token.substring(0, 50) + '...' : 'null'}
                </span>
              </div>
            </div>
          </div>

          {/* Browser Cookies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Browser Cookies
            </h2>
            <div className="font-mono text-sm">
              <pre className="p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                {cookies || 'No cookies found'}
              </pre>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Test Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Navigate to /admin
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Navigate to /login
              </button>
              <button
                onClick={() => {
                  setCookies(document.cookie);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Refresh Cookie Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
