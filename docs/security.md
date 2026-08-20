# Security

This is what this frontend actually does. There's no PCI/SOC2/2FA scope here — this app never touches card data or performs its own auth checks against a database; it's a client of the backend, and most real security enforcement (RLS, argon2 hashing, rate limiting) lives there — see the backend's `docs/security.md`. This doc covers what's specific to the frontend.

## Token storage

The access token is held **in memory only** (a module-level variable in `src/shared/lib/api-client.ts`, set via `setAccessToken`/read via `getAccessToken`) — never in `localStorage` or `sessionStorage`. This limits the blast radius of an XSS bug: a script that can run in the page can't read the token out of storage, since there's nothing to read it from. The tradeoff is that a full page reload loses it, which `AuthProvider`'s silent-refresh-on-mount exists specifically to recover from.

The refresh token never reaches JavaScript at all — it's an httpOnly cookie set and read only by the backend.

## CSRF

Double-submit cookie pattern, matching the backend's `CsrfGuard`: the backend sets a non-httpOnly `csrf-token` cookie on login/signup; `api-client.ts`'s request interceptor reads it via `document.cookie` and attaches it as an `X-CSRF-Token` header on every mutating request (`POST`/`PUT`/`DELETE`/`PATCH`). There is exactly one CSRF interceptor in this codebase — it lives here, not in `middleware.ts` (an earlier duplicate there tried to read from a `<meta>` tag that was never rendered and relied on `document`, which doesn't exist in the Edge runtime; it could never have run).

## Edge middleware route protection

`middleware.ts` verifies the backend-issued JWT directly (`jose`, shared `JWT_ACCESS_SECRET`) before a protected Server Component renders — this exists because every previous check was `"use client"`, meaning protection only kicked in after JS loaded, by which point any Server Component data-fetching on a "protected" page had already run on the server. **This is a fast first line of defense, not the only one** — real data access is still gated by the backend's own guards on every request regardless of what the middleware decided.

## Same-origin API surface

`next.config.ts` rewrites a single catch-all, `/api/backend/:path*`, to the backend, and `clientConfig.api.apiUrl` (`src/config/client.ts`) points axios's `baseURL` at that prefix **only in the browser** (`typeof window !== "undefined"`) — server-side calls use the backend's absolute URL instead, since there's no browser/cookie problem for those. This isn't optional: `access_token`/`refresh_token`/`csrf-token` are cookies set by the backend, and if the browser called the backend's absolute origin directly, those cookies would be scoped to the backend's domain — invisible to this app's `document.cookie` reads and to `middleware.ts` reading incoming request cookies on its own origin. A JSON response body (e.g. a successful login) still comes back fine either way even when this is broken, which is what makes a regression here easy to miss — only the cookie-dependent parts (CSRF, silent refresh, middleware) silently fail. Combined with `withCredentials: true` on both axios instances, this keeps cookies same-site, which is what makes the httpOnly refresh-token cookie usable at all under `sameSite: "lax"`.

## Sentry data scrubbing

`api-client.ts`'s response error interceptor deliberately does **not** forward the raw backend error response body to Sentry. Backend validation errors can include field-level details for a payment request (msisdn, amount — PII/financial data for a Kenyan M-Pesa platform). `scrubErrorDataForSentry` whitelists only the generic message, status code, and *which* fields failed validation — field names only, never the submitted values.

## What to avoid

- Don't move the access token into `localStorage`/`sessionStorage` "for convenience" — that's a deliberate XSS-hardening choice, not an oversight.
- Don't add a second CSRF-reading code path — `api-client.ts` is the only place that should read `csrf-token`.
- Don't treat `middleware.ts` passing as proof a request is authorized — it isn't, by design; the backend guard on the actual endpoint is the real check.
