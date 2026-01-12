import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT decode function (doesn't verify signature, just reads payload)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Extract token from localStorage in the request
function getTokenFromLocalStorage(request: NextRequest): string | null {
  try {
    // Try to get from cookie first
    const cookieToken = request.cookies.get('token')?.value;
    if (cookieToken) return cookieToken;

    // For client-side navigation, we can't access localStorage in middleware
    // So we'll skip middleware check for client-side navigation
    // The actual auth check will happen in the page component
    return null;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    console.log('=== ADMIN MIDDLEWARE CHECK ===');
    console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('Path:', pathname);
    console.log('Cookie token present:', !!token);

    // IMPORTANT: In production, if cookie is not present, we'll let the request through
    // and let the client-side auth check handle it (since token might be in localStorage)
    if (!token) {
      console.log('No cookie token found');

      // Check if this is a client-side navigation (has referer from same origin)
      const referer = request.headers.get('referer');
      const origin = request.headers.get('origin');

      if (referer || origin) {
        console.log('Client-side navigation detected - allowing through for client-side auth check');
        // Let it through - the page component will check localStorage
        return NextResponse.next();
      }

      // Direct navigation without cookie - redirect to login
      console.log('Direct navigation without cookie - redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('reason', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Decode token to check role
    const decoded = decodeJWT(token);
    console.log('Decoded token role:', decoded?.role);

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      console.log('User is not admin - access denied');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }

    console.log('Admin access granted via cookie');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
