import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
