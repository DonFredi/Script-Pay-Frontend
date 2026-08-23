import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // this app's own document.cookie and to proxy.ts.
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
