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
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('reason', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Decode token to check role
    const decoded = decodeJWT(token);

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      // User is authenticated but not an admin - redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
