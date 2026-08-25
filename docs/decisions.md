# Architecture Decision Log — ScriptPay Frontend

Each entry: the problem being solved, the choice made, and why the rejected
alternative(s) didn't fit. Verified against source comments and code as of
2026-08-21 — this file replaces the deleted `docs/decisions.md`, which
described a different, partly-fictional decision set. See the backend repo's
`docs/decisions.md` for the auth-token decision from the issuing side (`jose`
HS256 JWT instead of Firebase) — this entry covers the same decision from the
consuming side.

## 1. Edge middleware JWT verification instead of client-only route guards

**Problem**: Protected routes need to be genuinely protected before any data
fetching happens, not just hidden behind a client-side check that runs after
the page has already started rendering.

**Rejected**: The original approach — every route-protection check was
`"use client"` (`ProtectedLayout`, `admin/layout.tsx`). Protection only
kicked in after JS loaded and React rendered, so a Server Component's data
fetching on a "protected" page would already have executed on the server
before any client-side redirect could stop it. This is a real authorization
gap, not a cosmetic one — it depended entirely on the backend guard being the
only real check, with the frontend offering no early defense at all.

**Chosen**: `middleware.ts`, which didn't exist before, verifies the
backend-issued access token directly at the Edge with `jose`, the same
library and shared secret (`JWT_ACCESS_SECRET`) the backend uses to sign it.
This only became possible once the backend moved off Firebase (see backend
decision log entry 1) — Firebase's Admin SDK verification cannot run in the
Edge runtime at all, so Edge-level protection was never an option under the
old auth system.

## 2. Access token in memory, refresh token in an httpOnly cookie — not both in localStorage

**Problem**: The access token needs to be readable by client-side JS (to
attach `Authorization: Bearer` on API calls) without being stealable via a
XSS payload reading `localStorage`.

**Rejected**: Storing the access token in `localStorage`, the simplest option
and the one that "just works" across page reloads without a refresh dance.
Any successful XSS on the page can read `localStorage` directly and exfiltrate
a live session token — for a payments platform handling real money movement,
that risk isn't acceptable for convenience.

**Chosen**: The access token lives only in a module-level JS variable
(`setAccessToken`/`getAccessToken` in `api-client.ts`) — gone on a hard
refresh, recovered transparently via the httpOnly `refresh_token` cookie
(invisible to any JS, XSS included) on the next request. The trade-off is
deliberate: a hard refresh always costs one silent `/auth/refresh` round trip,
in exchange for the access token never being readable by any script on the
page.

## 3. Same-origin rewrite proxy for browser API calls instead of calling the backend directly

**Problem**: The browser needs to call the backend, but `access_token`,
`refresh_token`, and `csrf-token` are cookies the backend sets — and cookie
visibility is origin-scoped.

**Rejected**: Having the browser call the backend's absolute URL directly
(`NEXT_PUBLIC_API_URL`). This looks like it works — CORS can be configured to
allow it, and the JSON response body of a request (e.g. a successful login)
comes back fine. But the cookies the backend sets land on the *backend's*
origin, not this app's — invisible to `document.cookie` reads in
`api-client.ts` and to `middleware.ts` reading incoming request cookies on
its own origin. CSRF header attachment and silent refresh both silently stop
working, while login still appears to "succeed" — exactly the shape of bug
that's easy to ship and hard to catch in casual testing.

A bare `"/auth/:path*"`-style Next.js rewrite was also tried and rejected: it
never actually fires, because several backend paths (`/auth/login`,
`/profile`) are *also* real pages/routes in this Next.js app, and Next's
filesystem router always wins over array-style rewrites for any path that's
also a real page.

**Chosen**: `next.config.ts` rewrites everything under `/api/backend/:path*`
(a prefix no real page in this app uses) to the backend's real URL, and
`clientConfig.api.apiUrl` resolves to that same-origin path in the browser
(and to the backend's absolute URL on the server, where no browser/cookie
cross-origin problem exists to begin with).

## 4. Middleware lets non-admin routes through on a missing/expired access token if a refresh token exists

**Problem**: The access token is short-lived (~15 min) by design (decision 2
above), so it will legitimately be missing/expired on many page loads even
for a validly logged-in user — but Edge middleware can't itself run the
silent-refresh flow without adding latency to every navigation.

**Rejected**: Having `middleware.ts` call the backend's `/auth/refresh`
itself before rendering any protected page. This would add a network round
trip to every single navigation for a routine, expected situation (a token
that simply aged out), not just the exceptional case.

**Chosen**: If no access token is present/valid but a `refresh_token` cookie
still exists, non-admin protected routes are let through — the client-side
`AuthProvider`'s silent refresh and every API call's own 401-triggers-refresh
interceptor recover the session from there. `/admin/*` routes are the
explicit exception: without a verified role claim, middleware can't confirm
`SUPER_ADMIN` here, so those still redirect to login and rely on
client-side re-auth plus retry. Actual data access is unaffected either way —
the backend's own `AccessTokenGuard`/`RolesGuard` enforce authorization on
every request regardless of what middleware decided.

## 5. Single CSRF interceptor in `api-client.ts`, none in middleware

**Problem**: CSRF protection needs the `csrf-token` cookie value to attach as
an `X-CSRF-Token` header on state-changing requests.

**Rejected**: An earlier duplicate CSRF-reading implementation in
`middleware.ts` that read from a `<meta>` tag that was never actually
rendered, and separately relied on `document.cookie` — which doesn't exist in
the Edge runtime `middleware.ts` executes in. This code could never have run
correctly; it was dead logic that looked functional.

**Chosen**: One CSRF interceptor, in `src/shared/lib/api-client.ts`'s request
interceptor, which reads `document.cookie` client-side (where `document`
genuinely exists) and attaches `X-CSRF-Token` on POST/PUT/PATCH/DELETE only.

## 6. Separate client/server env schemas instead of one shared schema

**Problem**: `JWT_ACCESS_SECRET` (used by `middleware.ts` to verify tokens)
must never end up bundled into client-side JavaScript, while `NEXT_PUBLIC_*`
values are meant to be public and browser-readable.

**Rejected**: One shared env schema/module imported everywhere. Next.js
already relies on the `NEXT_PUBLIC_` prefix convention to decide what's
safe to inline into client bundles, but a single schema file makes it easy
for a server-only value to get imported from a client component by mistake,
with no structural barrier catching it.

**Chosen**: `src/config/env/clientEnv.ts` (browser-safe, `NEXT_PUBLIC_*` only)
and `src/config/env/serverEnv.ts` (server-only, includes `JWT_ACCESS_SECRET`)
are two independent, separately-validated modules — importing the server
schema from client code is a conscious, visible action, not an accident.

As part of the same cleanup, `clientEnv.ts` previously required six
`NEXT_PUBLIC_FIREBASE_*` variables as mandatory, meaning the app refused to
boot without Firebase credentials that nothing in the code read anymore once
auth moved to the backend (decision 1). Those were deleted along with the
rest of the Firebase integration rather than left as unused-but-required
config.

## 7. Sentry error reporting scrubs the response body before sending

**Problem**: `api-client.ts`'s response interceptor reports API errors to
Sentry for visibility, but backend validation errors can carry field-level
detail (zod's `flatten()` output) for requests that include real user PII —
specifically `msisdn` (a phone number) and payment amounts on payment
endpoints.

**Rejected**: Reporting the raw error response body as-is, the default and
simplest option, and the one that preserves the most debugging detail.

**Chosen**: `scrubErrorDataForSentry` whitelists exactly what's safe before
anything is sent to Sentry: the generic message, the HTTP status code, and
*which field names* failed validation — never the submitted values
themselves. 401/403 responses are excluded from reporting entirely, since
they're an expected part of the auth flow (token expiry, CSRF mismatch during
normal operation), not an exceptional condition worth alerting on.

## 8. Branding externalized to env vars instead of hardcoded in `site.ts`

**Problem**: This codebase is intended to be reused as the base for other,
differently-branded systems ScriptTagg builds for clients — not just operated
as a single multi-tenant SaaS product. `src/config/site.ts` hardcoded the
product name, description, contact details, and social links as literal
strings (`name: "Script Pay"`, `scripttagg@gmail.com`, etc.), and the `Tenant`
Prisma model on the backend has no branding fields either — every tenant of
one deployment necessarily sees identical branding, and standing up a
differently-branded deployment meant editing source, not configuring one.

**Rejected**: Leaving branding hardcoded until a second branded deployment is
actually needed, then forking `site.ts` at that point. This is the cheap
choice today and the expensive one the moment a second deployment exists —
every subsequent fix to `site.ts` would then need to be manually ported
across N forked copies instead of being a config change.

**Chosen**: `src/config/env/clientEnv.ts` adds `NEXT_PUBLIC_SITE_NAME`,
`NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_CONTACT_*`, `NEXT_PUBLIC_ADDRESS`,
`NEXT_PUBLIC_OG_IMAGE`, and `NEXT_PUBLIC_SOCIAL_*`, all optional and each
defaulting to ScriptPay's real current values — an unset `.env` behaves
identically to before. `clientConfig.branding` (`src/config/client.ts`)
exposes them, and `site.ts` now derives `siteConfig` entirely from
`clientConfig.branding` instead of literal strings, including deriving the
`tel:`/`mailto:`/`wa.me` links from the raw phone/email values rather than
requiring separate label/link env vars. This is deliberately scoped to
*branding* only — it does not attempt to extract shared code (the Daraja
client, the auth/CSRF pattern) into reusable packages, which is a larger,
separate change that isn't justified until a second real deployment exists.
