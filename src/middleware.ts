import { clerkMiddleware, createRouteMatcher  } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers for public and protected routes
const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up', '/' , '/api/webhook/register']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Check if the request is for a public route
  if (isPublicRoute(req)) {
    return NextResponse.next(); // Allow access to public routes
  }

  const user = auth();
  // If not authenticated, protect all other routes
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  try {
     // Fetch user details
     const userDetails = await user;
     const role = userDetails.orgRole

    // Role-based access control
    if (isAdminRoute(req) && role !== 'org:admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url)); // Redirect non-admins from admin routes
    }

    if (isDashboardRoute(req) && role === 'org:admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url)); // Redirect admin users to their dashboard
    }

    // Handle redirects for authenticated users accessing public routes
    if (isPublicRoute(req)) {
      return NextResponse.redirect(new URL(role === 'org:admin' ? '/admin/dashboard' : '/dashboard', req.url));
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.redirect(new URL('/error', req.url)); // Redirect to error page if fetching user fails
  }

  // If all checks pass, continue to the requested route
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
