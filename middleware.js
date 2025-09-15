import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/favicon.ico'
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  // Allow requests for static assets (files with an extension) to pass through
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const hasAuth = req.cookies.get('mermaid_auth')?.value === '1';

  // Redirect root based on auth
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = hasAuth ? '/home' : '/login';
    return NextResponse.redirect(url);
  }

  // If trying to access login while authenticated, go to /home
  if (isPublic && hasAuth && pathname.startsWith('/login')) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // Protect all non-public routes
  if (!isPublic && !hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|video-bg.mp4|public|api).*)'],
};


