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
  `middleware.ts` (`document` doesn't exist in the Edge runtime).

## Route protection is defense-in-depth, not the boundary

`middleware.ts` verifies the access token at the Edge before a protected page
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
app's own `document.cookie` reads and to `middleware.ts`. See
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
`middleware.ts` uses to verify a token this app never issues, only reads.
It is kept out of `clientEnv.ts` specifically so it structurally cannot be
bundled into client-side JavaScript; see `docs/decisions.md` entry 6 for why
the client/server env split exists as two separate schema files rather than
one shared one.

## What this app does not do (by design)

- Does not verify passwords, issue tokens, or make any authorization
  decision beyond the Edge-level route-protection heuristic above — all of
  that is the backend's job.
- Does not call Safaricom directly, ever — only the backend's
  `infrastructure/daraja/DarajaClient` does.
- Does not persist the access token anywhere durable — a hard refresh always
  costs one silent `/auth/refresh` round trip, deliberately, in exchange for
  the token never being readable from storage.

## Known gaps

- No automated test currently covers `middleware.ts`'s JWT verification path
  or `api-client.ts`'s 401-refresh-retry interceptor — both are
  security-relevant and untested (see `docs/testing.md`).
- No CI pipeline is configured in this repo as of 2026-08-21 (no
  `.github/workflows/`) — nothing currently runs `tsc`/`eslint`/tests
  automatically on a change.
