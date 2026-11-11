import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, logos)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow login route and API auth/status routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Read role and session cookie
  const userRole = request.cookies.get("pos_user_role")?.value;
  const userEmail = request.cookies.get("pos_user_email")?.value;

  // 3. If no session cookie exists, redirect strictly to /login
  if (!userRole || !userEmail) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    // Non-admin attempting to access /admin -> redirect to their designated home
    if (userRole === "cashier") {
      return NextResponse.redirect(new URL("/cashier/pos", request.url));
    } else if (userRole === "kitchen") {
      return NextResponse.redirect(new URL("/kitchen/dashboard", request.url));
    } else if (userRole === "rider") {
      return NextResponse.redirect(new URL("/rider/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/waiter/dashboard", request.url));
    }
  }

  // 5. If logged in user hits root '/', redirect to their role home
  if (pathname === "/") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (userRole === "cashier") {
      return NextResponse.redirect(new URL("/cashier/pos", request.url));
    } else if (userRole === "kitchen") {
      return NextResponse.redirect(new URL("/kitchen/dashboard", request.url));
    } else if (userRole === "rider") {
      return NextResponse.redirect(new URL("/rider/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/waiter/dashboard", request.url));
    }
  }

  return NextResponse.next();
}