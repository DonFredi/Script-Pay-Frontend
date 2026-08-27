import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
/**
 * This file did not exist at all before — every route protection check in this
 * codebase was `"use client"` (ProtectedLayout, admin/layout.tsx), meaning:
 *   1. Protection only kicked in after JS loaded and React rendered.
 *   2. Any Server Component data-fetching on a "protected" page would already have
 *      run on the server before a client-side redirect could ever stop it.
 * This middleware verifies the backend-issued access token directly, using the
 * SAME jose-based verification the backend uses to sign it (see
 * scriptpay-backend/src/modules/auth/token.service.ts) — this only works because
 * Approach B issues our own JWT rather than relying on Firebase's Admin SDK, which
 * cannot run on the Edge runtime at all.
 *
 * IMPORTANT: JWT_ACCESS_SECRET here must be the EXACT SAME value as the backend's
 * JWT_ACCESS_SECRET env var — this is a shared secret between the two codebases.
 *
 * Known tradeoff, on purpose: the access_token cookie is short-lived (~15 min,
 * matching the backend's JWT_ACCESS_TTL_SECONDS) so it can be legitimately expired
 * mid-session even though the person is still validly logged in via the long-lived
 * httpOnly refresh_token cookie. Rather than have middleware call the backend's
 * /auth/refresh itself on every navigation (extra latency on every request), an
 * expired/missing access token is allowed through IF a refresh_token cookie is
 * still present — the client-side AuthProvider's silent refresh and every API
 * call's own 401-triggers-refresh interceptor handle recovery from there. Actual
 * DATA access is still fully protected regardless, by the backend's own
 * AccessTokenGuard/RolesGuard on every request — this middleware is a fast,
 * page-load-time first line of defense, not the only line of defense.
 */

const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/payments",
  "/transactions",
  "/settings",
  "/profile",
  "/onboarding",
];
const ADMIN_ONLY_PREFIXES = ["/admin"];
// NOTE: CSRF token attachment lives in src/shared/lib/api-client.ts (requestInterceptor,
// reads the csrf-token cookie via document.cookie). This is the only CSRF interceptor —
// an earlier duplicate here read from a <meta> tag that was never rendered and relied on
// `document`, which doesn't exist in the Edge middleware runtime; it could never have run.

async function verifyAccessToken(token: string): Promise<{ role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { role: payload.role as string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // Neither cookie present at all — definitely not logged in, no ambiguity here.
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const claims = accessToken ? await verifyAccessToken(accessToken) : null;

  // Access token missing/expired but a refresh token still exists — let it
  // through; see the tradeoff note above. Role-gated admin routes are the one
  // exception: without a verified role claim we can't confirm SUPER_ADMIN here,
  // so those still redirect and rely on the client-side re-auth + retry.
  if (!claims) {
    if (ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && claims.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/payments/:path*",
    "/transactions/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
