import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './app/config';

// Keep track of redirect attempts to prevent loops
const MAX_REDIRECTS = 3;
const redirectCounts = new Map<string, number>();

export async function middleware(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || Math.random().toString(36).substring(2, 15);
  console.log(`[${requestId}] Middleware processing: ${req.nextUrl.pathname}`);
  
  // Check for static assets and images - return early
  const isStaticAsset = req.nextUrl.pathname.startsWith('/_next/') || 
                        req.nextUrl.pathname.includes('/favicon.ico') ||
                        req.nextUrl.pathname.startsWith('/public/');
  
  if (isStaticAsset) {
    return NextResponse.next();
  }
  
  // Create Next.js response
  const res = NextResponse.next();
  
  // Create Supabase client using the newer SSR package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.delete(name, options);
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  console.log(`[${requestId}] Path: ${req.nextUrl.pathname}, Authenticated: ${isAuthenticated}`);
  
  // Routes that should redirect to dashboard if user is logged in
  const authRedirectRoutes = AUTH_CONFIG.AUTH_REDIRECT_ROUTES;
  
  // Routes that authenticated users should be able to access directly (not redirect to dashboard)
  const authenticatedAccessRoutes = AUTH_CONFIG.AUTHENTICATED_ACCESS_ROUTES;
  
  // Routes that require authentication but shouldn't redirect to dashboard
  const protectedRoutes = AUTH_CONFIG.PROTECTED_ROUTES;
  
  // Check if current path is exact match for a route that should redirect
  const isAuthRedirectRoute = authRedirectRoutes.includes(req.nextUrl.pathname);
  
  // Check if current path is a route that authenticated users should be able to access directly
  const isAuthenticatedAccessRoute = authenticatedAccessRoutes.includes(req.nextUrl.pathname);
  
  // If user is logged in and trying to access a route that should redirect to dashboard
  // but not a route that authenticated users should be able to access directly
  if (isAuthenticated && isAuthRedirectRoute && !isAuthenticatedAccessRoute) {
    console.log(`[${requestId}] User is authenticated, redirecting from ${req.nextUrl.pathname} to dashboard`);
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Public routes that don't require authentication
  const publicRoutes = AUTH_CONFIG.PUBLIC_ROUTES;
  
  // Check if the current path is a public route or an API route
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/') || 
    (route === '/dashboard/demo' && req.nextUrl.pathname.startsWith('/dashboard/demo'))
  );
  
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  
  // Always allow access to public routes and API routes without authentication
  if ((isPublicRoute || isApiRoute) && !isAuthRedirectRoute) {
    console.log(`[${requestId}] Allowing access to public/API route: ${req.nextUrl.pathname}`);
    return NextResponse.next();
  }
  
  try {
    // Check for redirect loop prevention cookies
    const redirectLoopPreventionCookie = req.cookies.get('redirect_loop_prevention');
    const subscriptionRedirectPreventionCookie = req.cookies.get('subscription_redirect_prevention');
    
    if ((redirectLoopPreventionCookie && redirectLoopPreventionCookie.value === 'true') || 
        (subscriptionRedirectPreventionCookie && subscriptionRedirectPreventionCookie.value === 'true')) {
      console.log(`[${requestId}] Redirect loop prevention cookie found, allowing access to: ${req.nextUrl.pathname}`);
      return NextResponse.next();
    }
    
    // Check if we're in a redirect loop
    const currentPath = req.nextUrl.pathname;
    const redirectCount = redirectCounts.get(currentPath) || 0;
    
    if (redirectCount >= MAX_REDIRECTS) {
      console.error(`[${requestId}] Detected redirect loop for ${currentPath}. Allowing access to prevent infinite loop.`);
      redirectCounts.delete(currentPath); // Reset the counter
      
      // Set a cookie to prevent further redirects
      const response = NextResponse.next();
      response.cookies.set({
        name: 'redirect_loop_prevention',
        value: 'true',
        path: '/',
        maxAge: 60, // 60 seconds
        httpOnly: false
      });
      
      return response;
    }
    
    // Check if the current path requires authentication
    const requiresAuth = req.nextUrl.pathname.startsWith('/dashboard/') ||
                        protectedRoutes.includes(req.nextUrl.pathname);
    
    // If no session and not a public route, redirect to login
    if (!isAuthenticated && (!isPublicRoute || requiresAuth) && !isApiRoute) {
      console.log(`[${requestId}] No active session. Redirecting to login from: ${req.nextUrl.pathname}`);
      
      // Increment redirect count
      redirectCounts.set(currentPath, redirectCount + 1);
      
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
      
      // Set a response with the redirect
      const redirectResponse = NextResponse.redirect(loginUrl);
      
      // Set a flag cookie to indicate we're in a redirect flow
      redirectResponse.cookies.set({
        name: 'auth_redirect',
        value: 'true',
        path: '/',
        maxAge: 5, // 5 seconds
        httpOnly: false
      });
      
      return redirectResponse;
    }
    
    // If there is a session, log information for debugging
    if (isAuthenticated) {
      console.log(`[${requestId}] Authenticated access to: ${req.nextUrl.pathname} (User: ${session.user.id})`);
      
      // Reset redirect count for this path since authentication succeeded
      redirectCounts.delete(currentPath);
      
      // Set a cookie to indicate successful authentication
      res.cookies.set({
        name: 'auth_verified',
        value: 'true',
        path: '/',
        maxAge: 60, // 60 seconds
        httpOnly: false
      });
      
      // Add auth information to request headers
      res.headers.set('x-user-id', session.user.id);
      res.headers.set('x-user-email', session.user.email || '');
      res.headers.set('x-authenticated', 'true');
    }
    
    return res;
  } catch (error) {
    console.error(`[${requestId}] Middleware error:`, error);
    
    // If there's an error with Supabase, still allow access to public routes and API routes
    if (isPublicRoute || isApiRoute) {
      return NextResponse.next();
    }
    
    // For other routes, redirect to login on error
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)','/', '/register', '/login', '/forgot-password', '/reset-password', '/subscription', '/dashboard/subscription', '/dashboard/demo', '/demo'],
}; 