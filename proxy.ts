import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/app"];

// Public routes that authenticated users should be redirected away from
const publicOnlyRoutes = [
  "/",
  "/how-it-works",
  "/pricing",
  "/about",
  "/blog",
  "/kontakt",
  "/privacy",
  "/terms",
  "/cookies",
];

export async function proxy(request: NextRequest) {
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const isSecureRequest = request.nextUrl.protocol === "https:";

  let token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: isSecureRequest,
  });

  if (!token) {
    token = await getToken({
      req: request,
      secret: authSecret,
      secureCookie: !isSecureRequest,
    });
  }

  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current path is a public-only route
  const isPublicOnlyRoute = publicOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from public-only routes to /app
  if (isAuthenticated && isPublicOnlyRoute) {
    const url = new URL("/app", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (keep API routes unaffected)
     */
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$|api).*)",
  ],
};
