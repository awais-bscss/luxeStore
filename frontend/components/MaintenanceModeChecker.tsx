"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useSettings } from '../contexts/SettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function MaintenanceModeChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { settings, loading: settingsLoading } = useSettings();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (settingsLoading) return;

    const maintenanceEnabled = settings.maintenanceMode;
    const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

    // If maintenance mode is on and user is not admin
    if (maintenanceEnabled) {
      // Don't redirect if already on maintenance page or if user is admin or if on admin routes
      if (!pathname.startsWith('/maintenance') && !pathname.startsWith('/admin') && !isAdmin) {
        router.push('/maintenance');
      }
    } else {
      // If maintenance mode is off and user is on maintenance page, redirect home
      if (pathname.startsWith('/maintenance')) {
        router.push('/');
      }
    }

    setIsChecking(false);
  }, [settings, settingsLoading, pathname, user, router]);

  // Show loading only on first check
  if (isChecking && !settings.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
