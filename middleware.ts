import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Supabase session cookies (presence means logged in)
  const accessToken = req.cookies.get('sb-access-token');
  const refreshToken = req.cookies.get('sb-refresh-token');

  // Our role cookie set at login
  const roleCookie = req.cookies.get('role')?.value;

  const isProtectedRoute =
    url.pathname.startsWith('/admin') || url.pathname.startsWith('/owner');

  // If accessing protected routes without a session, redirect
  if (isProtectedRoute && !accessToken && !refreshToken) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role enforcement
  if (url.pathname.startsWith('/admin')) {
    if (roleCookie !== 'admin') {
      url.pathname = '/owner/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith('/owner')) {
    if (roleCookie !== 'owner') {
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'],
};