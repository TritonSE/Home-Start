import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

function redirectToLogin(request: NextRequest, reason: string) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  console.info(`[middleware] redirecting ${request.nextUrl.pathname} to /login (${reason})`);
  return response;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("firebaseAuthToken");
  const { pathname } = request.nextUrl;

  console.info(`[middleware] ${pathname} token=${token ? "present" : "missing"}`);

  // Allowed routes w/o authentication
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Unauthenticated users get redirected to login page
  if (!token) {
    return redirectToLogin(request, "missing token");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude middleware logic for requests such as images, api requests, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
