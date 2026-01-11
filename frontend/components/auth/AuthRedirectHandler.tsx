"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/hooks/useRedux';

/**
 * Global authentication redirect handler
 * Redirects users after login based on their role and current location
 */
export function AuthRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    // Only trigger redirect when auth state changes from false to true (user just logged in)
    const justLoggedIn = !previousAuthState.current && isAuthenticated;
    previousAuthState.current = isAuthenticated;

    if (justLoggedIn && user) {
      // Don't redirect if already on login page (login page has its own redirect logic)
      if (pathname === '/login') {
        return;
      }

      // Don't redirect if on checkout or other important pages
      const noRedirectPages = ['/checkout', '/cart', '/orders'];
      if (noRedirectPages.some(page => pathname.startsWith(page))) {
        return;
      }

      // Redirect admins to dashboard with delay to ensure cookie is set
      if (user.role === 'admin' || user.role === 'superadmin') {
        setTimeout(() => {
          router.push('/admin');
        }, 1000); // Wait for cookie to be set
      }
      // Regular users stay on current page (no redirect needed)
    }
  }, [isAuthenticated, user, pathname, router]);

  return null;
}
