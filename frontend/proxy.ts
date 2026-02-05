// middleware.ts - UPDATED
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',  // ✅ Add SSO callback as public
  '/about(.*)',
  '/services(.*)',
  '/contact(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  // Debug logging
  console.log('Path:', url.pathname);
  console.log('Hash:', url.hash);
  console.log('Search params:', Object.fromEntries(url.searchParams));

  // ✅ Handle SSO callback - redirect to home
  if (url.pathname === '/sign-up' && url.hash.includes('sso-callback')) {
    console.log('SSO callback detected, redirecting to home');
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // If user is logged in and tries to access auth pages, redirect to home
  if (userId && (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up'))) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};