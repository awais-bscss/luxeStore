"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useRedux";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowPasswordExpired?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, allowPasswordExpired = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isPasswordExpired } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    // Check role-based access only after loading completes
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated - redirect to login page
        router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      // Check if password expired (unless this route allows expired passwords)
      if (isPasswordExpired && !allowPasswordExpired) {
        // Password expired - redirect to account settings
        router.push("/account?tab=settings&reason=password_expired");
        return;
      }

      if (requireAdmin && (user?.role !== "admin" && user?.role !== "superadmin")) {
        // Admin route but not admin/superadmin - redirect to home
        router.push("/");
      }
    }
  }, [user, isAuthenticated, isLoading, requireAdmin, router, isPasswordExpired, allowPasswordExpired]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If admin required but not authenticated or not admin/superadmin, don't render
  if (requireAdmin && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "superadmin"))) {
    return null;
  }

  return <>{children}</>;
}
