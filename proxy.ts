
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

const ALLOWED_EMAIL = "pedrotovarporto@gmail.com";

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId, sessionClaims } = await auth();
    
    // Protect the route first (ensures user is logged in)
    if (!userId) {
      await auth.protect();
      return;
    }

    // Check if the email matches the allowed one
    const userEmail = sessionClaims?.email as string;
    
    if (userEmail !== ALLOWED_EMAIL) {
      // Redirect to sign-in if not authorized
      return Response.redirect(new URL('/sign-in', request.url));
    }
  }
});

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
