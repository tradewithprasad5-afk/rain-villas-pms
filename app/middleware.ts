import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Prevents the Android WebView (Capacitor) from caching stale HTML
// pages, which was causing the back button to show an old,
// un-styled version of the dashboard instead of the current one.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "no-store, must-revalidate"
  );

  return response;
}

export const config = {
  // Apply to page routes only — not static assets like
  // /_next/static, which should stay cached for performance.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo|payment).*)",
  ],
};
