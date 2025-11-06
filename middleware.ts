import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow home page without authentication
    if (path === "/") {
      return NextResponse.next();
    }

    // Admin routes - only accessible by ADMIN role
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Teacher routes - accessible by ADMIN and TEACHER roles
    if (path.startsWith("/teacher")) {
      if (token?.role !== "ADMIN" && token?.role !== "TEACHER") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Student routes - accessible by ADMIN and STUDENT roles
    if (path.startsWith("/student")) {
      if (token?.role !== "ADMIN" && token?.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow home page without token
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        return !!token;
      },
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (home page)
     * - /auth/* (authentication pages)
     * - /api/auth/* (NextAuth API routes)
     * - /api/schools (public schools list for signup)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     */
    "/((?!api/auth|api/schools|auth|_next|favicon.ico|robots.txt).*)",
  ],
};
