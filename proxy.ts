import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.flutterwave.com https://*.public.blob.vercel-storage.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://checkout.flutterwave.com;
    frame-ancestors 'none';
    frame-src https://checkout.flutterwave.com;
    connect-src 'self' https://api.flutterwave.com;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Basic auth guard for dashboard and onboarding
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') || 
                      request.nextUrl.pathname.startsWith('/products') || 
                      request.nextUrl.pathname.startsWith('/orders') ||
                      request.nextUrl.pathname.startsWith('/onboarding');
                      
  const hasSession = request.cookies.has('authjs.session-token') || 
                     request.cookies.has('__Secure-authjs.session-token');

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/auth?mode=login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
