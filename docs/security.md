# Security — ScriptPay Frontend

This app enforces no authorization itself — every real permission check
happens in the backend (`Script-Pay-Backend`'s `AccessTokenGuard`/
`RolesGuard`/`ApiKeyGuard`, see that repo's `docs/security.md`). What follows
is what this repo is actually responsible for: not leaking or mishandling the
session it's given. Verified against source as of 2026-08-21.

## Session token handling

- **Access token**: held only in a module-level JS variable
  (`setAccessToken`/`getAccessToken` in `src/shared/lib/api-client.ts`) —
  never `localStorage`, never `sessionStorage`. It does not survive a hard
  refresh by design; recovered via the refresh cookie on next load. This
  means an XSS payload that can execute JS can still read the *current*
  in-memory token (unavoidable — it must be attachable to requests somehow),
  but cannot read a persisted copy from storage, and gains nothing from a
  page the user hasn't visited yet.
- **Refresh token**: httpOnly cookie, set and cleared only by the backend —
  this app's JS never reads or writes it directly, and cannot, by design.
- **CSRF token**: the one deliberately non-httpOnly cookie, since the whole
  point is that `api-client.ts` must read it (`document.cookie`) to echo it
  back as `X-CSRF-Token`. See `docs/architecture.md`/`docs/decisions.md` for
  why this interceptor exists only in `api-client.ts` and never in
  `proxy.ts` (`document` doesn't exist in proxy.ts's Node.js runtime).

## Route protection is defense-in-depth, not the boundary

`proxy.ts` verifies the access token server-side before a protected page
renders — this stops the specific failure mode where a Server Component's
data fetching would otherwise run before any client-side redirect could react
(see `docs/decisions.md` entry 1). It is **not** the authorization boundary:
every actual data request still goes through the backend's own guards
regardless of what middleware decided, and middleware deliberately lets
non-admin routes through on a missing/expired access token if a refresh
token is still present (decision 4) — a request that reaches the backend
with no valid credential still gets a 401 there, refreshed transparently by
`api-client.ts`.

## Why the browser never calls the backend's absolute URL

All browser-originated API calls go through the same-origin
`/api/backend/*` rewrite (`next.config.ts`), never the backend's real URL
directly — required for the cookies the backend sets to be visible to this
app's own `document.cookie` reads and to `proxy.ts`. See
`docs/decisions.md` entry 3 for the specific way calling the backend
directly fails silently (login still "succeeds," only cookie-dependent
behavior breaks). Server-side calls (SSR, route handlers) do use the
backend's absolute URL — no browser/cookie cross-origin problem exists there.

## What gets sent to Sentry, and what's deliberately scrubbed

`api-client.ts`'s response interceptor reports API errors to Sentry, but
**never forwards the raw response body**. Backend validation errors can
include field-level detail (zod's `flatten()` output) for payment requests,
which carry `msisdn` (a real phone number) and payment amounts — PII and
financial data for a Kenyan M-Pesa platform. `scrubErrorDataForSentry`
whitelists only: the generic message, the HTTP status code, and *which field
names* failed validation — never the submitted values. 401/403 responses
aren't reported at all (expected auth flow, not an exceptional condition).

## Environment secrets

`JWT_ACCESS_SECRET` (server-only, `src/config/env/serverEnv.ts`) must be
byte-for-byte identical to the backend's own value — it's what
`proxy.ts` uses to verify a token this app never issues, only reads.
It is kept out of `clientEnv.ts` specifically so it structurally cannot be
bundled into client-side JavaScript; see `docs/decisions.md` entry 6 for why
the client/server env split exists as two separate schema files rather than
one shared one.

## What this app does not do (by design)

- Does not verify passwords, issue tokens, or make any authorization
  decision beyond the proxy.ts route-protection heuristic above — all of
  that is the backend's job.
- Does not call Safaricom directly, ever — only the backend's
  `infrastructure/daraja/DarajaClient` does.
- Does not persist the access token anywhere durable — a hard refresh always
  costs one silent `/auth/refresh` round trip, deliberately, in exchange for
  the token never being readable from storage.

## Known gaps

- No E2E/integration test exercises the real login → cookie → refresh →
  retry flow against an actual `Script-Pay-Backend` instance — everything
  today is unit-level with mocked `axios`/api modules (see
  `docs/testing.md`). The individual pieces (`proxy.ts`'s JWT
  verification, `api-client.ts`'s 401-refresh-retry interceptor,
  `AuthProvider.tsx`'s rehydration logic) are each unit-tested, but the
  full chain end-to-end against a real backend is not.

Resolved since this was last reviewed: `proxy.ts`'s JWT verification
and `api-client.ts`'s 401-refresh-retry interceptor are both now covered by
`proxy.spec.ts` / `api-client.spec.ts` (see `docs/testing.md`), and a
CI pipeline (`.github/workflows/ci.yml`, added 2026-08-25) now runs
`tsc`/`eslint`/tests on every push and PR.

- **Fixed (backend-side): `/auth/refresh` missing `CsrfGuard`.** This section
  used to describe `Script-Pay-Backend`'s `AuthController.refresh` as the one
  state-changing route with no CSRF guard at all (found 2026-08-28). It now
  carries `@UseGuards(RefreshCsrfGuard)` — a `CsrfGuard` subclass
  (`refresh-csrf.guard.ts`) that exempts only requests with no `refresh_token`
  cookie, since a logged-out visitor's blind refresh call is a documented,
  intentional no-op (`AuthProvider.tsx` calls this on first load expecting
  `{ accessToken: null }`, not a 403). Full CSRF validation still applies the
  moment a session cookie is present — the only case where a forged refresh
  could actually rotate someone's token. `api-client.ts`'s `apiPrivate`
  interceptor already attaches the CSRF header on this call, so no frontend
  change was needed once the backend guard landed.

- **Fixed 2026-09-18: `forgot-password`/`reset-password`/`verify-email`/
  `resend-verification` all 403'd with "CSRF token missing" for every real
  caller.** These four routes are exactly the ones a visitor with **no**
  session hits — but the `csrf-token` cookie is only ever issued by
  `signup`/`login`/`refresh`, so a logged-out user calling them (the normal
  case) never had one. Plain `CsrfGuard` on all four meant they only worked
  by accident, when a stale cookie survived from an earlier session in the
  same browser. Fix (backend-side, `auth.controller.ts`): dropped
  `@UseGuards(CsrfGuard)` from all four. `reset-password`/`verify-email`
  don't need it — the emailed, single-use token in the body is itself the
  possession proof a forged request can't supply. `forgot-password`/
  `resend-verification` have no session state for a forgery to change, and
  `StrictPaymentThrottle` already rate-limits them. No frontend change was
  needed; `api-client.ts` simply stops having a header to send that nothing
  checks on these four paths.

- **Fixed 2026-08-31**: the 401-refresh-retry interceptor treated the
  backend's `/auth/refresh` returning HTTP 200 with `accessToken: null` (its
  "no valid session" response, not an error) as a successful refresh — it
  retried the queued/original requests with no `Authorization` header, they
  401'd again, and since `_retry` was already set the interceptor just gave
  up with no logout and no redirect. In practice: a user's session dying
  mid-use (not on page load, where `AuthProvider` already handled this same
  response shape correctly) left them stuck on pages that could never load
  data again until they manually logged out and back in. See
  `docs/decisions.md` entry 9 for the fix — the interceptor now treats a
  null-token refresh as a failure and dispatches `"auth:session-expired"`,
  which `AuthProvider` uses to clear the session and let the existing
  redirect-when-unauthenticated logic take over.
