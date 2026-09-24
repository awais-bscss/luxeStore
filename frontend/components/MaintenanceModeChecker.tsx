"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useSettings } from '@/contexts/SettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function MaintenanceModeChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { settings, loading: settingsLoading } = useSettings();

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
  }, [settings, settingsLoading, pathname, user, router]);

  return <>{children}</>;
}
