"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';

// Session configuration
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

export default function SessionManager() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { items } = useAppSelector((state: RootState) => state.cart);

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Sync with backend - occasionally ping to keep server session alive if user is active
  const syncWithBackend = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      // You could add a ping endpoint here if needed, but the protect middleware
      // already updates lastActivity on every request.
    } catch (err) {
      console.error('Session sync error:', err);
    }
  }, [isAuthenticated]);

  // Reset activity on user interactions
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Check session status
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;

    // Session expired
    if (timeSinceActivity >= SESSION_DURATION) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      // 1. Save cart to localStorage before logout to "keep it safe"
      if (items.length > 0) {
        localStorage.setItem('expired_session_cart', JSON.stringify(items));
      }

      // 2. Perform logout
      await dispatch(logout());

      // 3. Notify user
      dispatch(addToast({
        type: 'warning',
        title: 'Session Expired',
        message: 'Your session has expired due to inactivity. Please login again to continue.'
      }));

      // 4. Redirect to home/login
      router.push('/login?reason=session_expired');
    }
  }, [isAuthenticated, items, dispatch, router]);

  // Start session monitoring
  useEffect(() => {
    if (!isAuthenticated) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      return;
    }

    // Set up interval
    checkIntervalRef.current = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, checkSession]);

  return null; // This component doesn't render anything anymore (no modals)
}
