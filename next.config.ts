import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// script-src needs 'unsafe-eval' in dev only (webpack/Turbopack HMR eval()s
// chunks) — omitted in production. 'unsafe-inline' stays for both: Next's own
// bootstrap/hydration scripts and styled-jsx-style inline styles rely on it,
// and moving to a nonce-based CSP would mean threading a per-request nonce
// through middleware into every layout — a real follow-up, not this pass.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Sentry's tunnelRoute (/monitoring, see below) proxies error reports
  // same-origin specifically so this doesn't need to allow *.sentry.io here.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Drops the "X-Powered-By: Next.js" response header — no functional benefit
  // to advertising the framework/version to every request.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Only meaningful over HTTPS (production/Vercel) — browsers ignore it on plain HTTP dev.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    return [
      // Single same-origin proxy prefix for every backend call the browser makes
      // (api-client.ts's baseURL for browser requests). /auth/login, /profile etc.
      // are ALSO real Next.js pages — a bare "/auth/:path*" rewrite never fires,
      // since Next's filesystem router always wins over array-style rewrites — so
      // everything is routed under /api/backend/*, which no real page uses, and
      // stripped back to the backend's real path here. This also keeps
      // access_token/refresh_token/csrf-token cookies same-origin: calling the
      // backend's absolute URL directly from the browser instead of through this
      // proxy means those cookies get set on the BACKEND's origin, invisible to
      // this app's own document.cookie and to middleware.ts.
      { source: "/api/backend/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "scripttagg",
  project: "scripttagg",
  authToken: process.env.SENTRY_AUTH_TOKEN, // read directly — never import @/config/server here
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
