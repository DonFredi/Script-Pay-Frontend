import { clientEnv } from "./env/clientEnv";

export const clientConfig = {
  app: {
    env: clientEnv.NODE_ENV,
    siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
    sentryClientDsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  },
  api: {
    // Absolute backend URL — for any server-side calls (SSR, route handlers),
    // where there's no browser/cookie cross-origin problem to begin with.
    backendUrl: clientEnv.NEXT_PUBLIC_API_URL,

    // Browser requests go through a same-origin Next.js rewrite (/api/backend/:path*
    // → backend, see next.config.ts) instead of hitting the backend's absolute URL
    // directly. This is REQUIRED, not optional: access_token/refresh_token/csrf-token
    // are cookies set by the backend — if the browser calls the backend's own origin
    // directly, those cookies get scoped to the backend's domain and are invisible to
    // this app's document.cookie reads and to proxy.ts reading incoming request
    // cookies on ITS OWN origin. Calling the backend directly from the browser breaks
    // CSRF token reading and session verification, even though the JSON response body
    // (e.g. a successful login payload) still comes back fine either way — that's what
    // makes this regression easy to miss: login still "succeeds," only the cookie-
    // dependent parts (CSRF, silent refresh, proxy) silently break.
    apiUrl: typeof window !== "undefined" ? "/api/backend" : clientEnv.NEXT_PUBLIC_API_URL,
  },
};
