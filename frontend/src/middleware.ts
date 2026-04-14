import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("firebaseAuthToken");
  const { pathname } = request.nextUrl;

  // Allowed routes w/o authentication
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Unauthenticated users get redirected to login page
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude middleware logic for requests such as images, api requests, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
