"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function MaintenanceModeChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    checkMaintenanceMode();

    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);

    return () => clearInterval(interval);
  }, [pathname, user]);

  const checkMaintenanceMode = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();

      if (data.success) {
        const maintenanceEnabled = data.data.settings.maintenanceMode;
        setIsMaintenanceMode(maintenanceEnabled);

        // If maintenance mode is on and user is not admin
        if (maintenanceEnabled) {
          const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

          // Don't redirect if already on maintenance page or if user is admin
          if (!pathname.startsWith('/maintenance') && !pathname.startsWith('/admin') && !isAdmin) {
            router.push('/maintenance');
          }
        } else {
          // If maintenance mode is off and user is on maintenance page, redirect home
          if (pathname.startsWith('/maintenance')) {
            router.push('/');
          }
        }
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading only on first check
  if (isChecking && !isMaintenanceMode) {
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
