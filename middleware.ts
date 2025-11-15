import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token'); // Supabase sets this cookie
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // You can add role checks here if you store role in JWT or session
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'], // protect these routes
};