"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { Clock, AlertTriangle, LogIn, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Session configuration
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before expiry
const CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

export default function SessionManager() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [showWarning, setShowWarning] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  }, []);

  // Reset activity on user interactions
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Check session status
  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const remaining = SESSION_DURATION - timeSinceActivity;

    // Session expired
    if (remaining <= 0) {
      setShowWarning(false);
      setShowExpiredModal(true);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
      return;
    }

    // Show warning
    if (remaining <= WARNING_TIME && !showWarning) {
      setShowWarning(true);
      setTimeRemaining(remaining);

      // Start countdown
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
      warningIntervalRef.current = setInterval(() => {
        const newRemaining = SESSION_DURATION - (Date.now() - lastActivityRef.current);
        if (newRemaining > 0) {
          setTimeRemaining(newRemaining);
        }
      }, 1000);
    }
  }, [isAuthenticated, showWarning]);

  // Start session monitoring
  useEffect(() => {
    if (!isAuthenticated) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
      return;
    }

    // Initial check
    checkSession();

    // Set up interval
    checkIntervalRef.current = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
    };
  }, [isAuthenticated, checkSession]);

  // Extend session (user clicked "Stay Signed In")
  const extendSession = () => {
    updateActivity();
    setShowWarning(false);
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
    }
  };

  // Re-authenticate without losing data
  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReauthenticating(true);
    setReauthError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: user?.email,
          password: reauthPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Session renewed
        updateActivity();
        setShowExpiredModal(false);
        setReauthPassword('');

        // Restart monitoring
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        checkIntervalRef.current = setInterval(checkSession, CHECK_INTERVAL);
      } else {
        setReauthError(data.message || 'Invalid password');
      }
    } catch (error) {
      setReauthError('Failed to re-authenticate. Please try again.');
    } finally {
      setIsReauthenticating(false);
    }
  };

  // Logout (user chose to logout)
  const handleLogout = () => {
    dispatch(logout());
    setShowWarning(false);
    setShowExpiredModal(false);
    router.push('/'); // Redirect to homepage where login modal is
  };

  // Format time remaining
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Inactivity Warning Modal */}
      {showWarning && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-yellow-200 dark:border-yellow-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Session Expiring Soon</h2>
                </div>
                <p className="text-yellow-100">
                  Your session will expire in {formatTime(timeRemaining)}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">You've been inactive</p>
                    <p>To keep your session active and preserve any unsaved work, please click "Stay Signed In".</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={extendSession}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Stay Signed In
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Session Expired Modal */}
      {showExpiredModal && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Session Expired</h2>
                </div>
                <p className="text-red-100">
                  Your session has expired due to inactivity
                </p>
              </div>

              {/* Content */}
              <form onSubmit={handleReauthenticate} className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Don't worry!</span> Re-enter your password to continue without losing your work.
                  </p>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoFocus
                  />
                </div>

                {/* Error Message */}
                {reauthError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {reauthError}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isReauthenticating || !reauthPassword}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {isReauthenticating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Continue Session
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
