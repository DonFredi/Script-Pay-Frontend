import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    return [
      // /api prefix is required here specifically because /auth/login, /auth/register
      // etc. are ALSO real Next.js pages — a bare "/auth/:path*" rewrite never fires,
      // since Next's filesystem router always wins over array-style rewrites. This was
      // the actual root cause of every login/register failure this whole session.
      { source: "/api/auth/:path*", destination: `${backendUrl}/auth/:path*` },
      { source: "/api/profile", destination: `${backendUrl}/profile` },
      { source: "/api/profile/:path*", destination: `${backendUrl}/profile/:path*` },
      // No collision risk here — nothing in app/ uses a "v1" segment.
      { source: "/v1/:path*", destination: `${backendUrl}/v1/:path*` },
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
