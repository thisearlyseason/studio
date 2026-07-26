import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
const PROTECTED_ROOTS = new Set([
  'admin', 'calendar', 'chats', 'club', 'coaches-corner', 'competition',
  'dashboard', 'drills', 'equipment', 'events', 'facilities', 'family',
  'feed', 'files', 'fundraising', 'games', 'manage-tournaments', 'practice',
  'roster', 'safety', 'settings', 'team', 'teams', 'volunteers',
]);

function isProtectedPath(pathname: string) {
  if (pathname.startsWith('/events/register/')) return false;
  if (pathname === '/leagues' || pathname === '/leagues/') return true;
  if (pathname === '/tournaments' || pathname === '/tournaments/') return true;
  const root = pathname.split('/').filter(Boolean)[0] || '';
  return PROTECTED_ROOTS.has(root);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Mitigate log noise from common bot probes (WordPress, PHP, Env files)
  const botProbes = [
    '/wp-login.php',
    '/wp-admin',
    '/xmlrpc.php',
    '/index.php',
    '/.env',
    '/wordpress',
    '/wp-content',
  ]
  
  if (botProbes.some(probe => pathname.includes(probe))) {
    // Return a lightweight 404 response to avoid triggering heavy page rendering
    return new NextResponse(null, { status: 404 })
  }

  // 2. Prevent 500 errors on the home page from malicious/malformed POST requests
  // Normal Next.js navigation and server actions are handled separately
  if (request.method === 'POST' && pathname === '/') {
    const isServerAction = request.headers.has('next-action')
    if (!isServerAction) {
      return new NextResponse('Method Not Allowed', { status: 405 })
    }
  }

  if (isProtectedPath(pathname)) {
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('reason', 'expired');
      loginUrl.searchParams.set('returnTo', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const verification = await fetch(new URL('/api/auth/session', request.url), {
        headers: { cookie: `__session=${sessionCookie}` },
        cache: 'no-store',
      });
      if (!verification.ok) throw new Error('INVALID_SESSION');
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('reason', 'expired');
      loginUrl.searchParams.set('returnTo', `${pathname}${request.nextUrl.search}`);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('__session');
      return response;
    }
  }
 
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes are handled by their own handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
