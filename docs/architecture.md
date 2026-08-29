# Architecture — ScriptPay Frontend

Current-state description of how this Next.js 16 (App Router) app works.
No aspirational content — everything here is verified against the source in
`src/` as of 2026-08-21. See `CLAUDE.md` for the full stack list; this
document is about how requests actually flow through the app and why.

## System context

```
Browser
  │
  ▼
Next.js 16 App Router (this repo) ── Edge middleware (middleware.ts)
  │
  ├─ Server: SSR / route handlers → call the backend's absolute URL directly
  └─ Client: axios (api-client.ts) → same-origin rewrite proxy → backend
                                                │
                                                ▼
                                  Script-Pay-Backend (NestJS, separate repo)
                                       → PostgreSQL, Safaricom Daraja
```

This app owns no database and never calls Safaricom directly — it is a pure
REST client of the backend.

## Why browser requests go through a same-origin proxy, not the backend directly

`next.config.ts` rewrites `/api/backend/:path*` → the backend's real URL.
`src/config/client.ts`'s `clientConfig.api.apiUrl` resolves to `/api/backend`
in the browser and to the backend's absolute URL on the server:

```ts
apiUrl: typeof window !== "undefined" ? "/api/backend" : clientEnv.NEXT_PUBLIC_API_URL
```

This split exists because `access_token`, `refresh_token`, and `csrf-token`
are cookies **set by the backend**. If the browser called the backend's
absolute URL directly, those cookies would be scoped to the backend's own
origin — invisible to this app's `document.cookie` reads and to
`middleware.ts` reading incoming request cookies on its own origin. The JSON
response body of a request (e.g. a successful login payload) would still
come back fine either way, which is exactly what makes this regression easy
to miss in review — only the cookie-dependent parts (CSRF header attachment,
silent refresh, middleware route protection) would silently stop working.

A bare `"/auth/:path*"` rewrite was tried and doesn't work: several backend
paths (`/auth/login`, `/profile`) are *also* real Next.js pages/routes in
this app, and Next's filesystem router always wins over array-style
rewrites for any path that's also a real page. `/api/backend/*` was chosen
specifically because no real page in this app uses that prefix.

## Auth model and request lifecycle

Session state is driven entirely by the backend's own JWT/refresh-token
pair — there is no client-side auth SDK.

```
Login/signup
  → backend sets access_token (httpOnly), refresh_token (httpOnly),
    csrf-token (NOT httpOnly) cookies
  → AuthProvider calls setAccessToken() to also hold the access token in memory

Every subsequent request (api-client.ts)
  request interceptor:
    - Authorization: Bearer <in-memory access token>
    - X-CSRF-Token: <read from document.cookie> — only on POST/PUT/PATCH/DELETE
  response interceptor:
    - on 401 (not already retried, not the /auth/refresh call itself):
        queue concurrent requests behind one in-flight refresh
        POST /auth/refresh → new access token → setAccessToken() → retry queued + original
    - on refresh failure: clear access token (logout), reject

Edge middleware (middleware.ts), before any protected page renders:
  - no access_token AND no refresh_token → redirect to /auth/login
  - access_token present and valid (jose.jwtVerify, same secret as backend) → proceed,
    and additionally check role for /admin/* routes
  - access_token missing/expired but refresh_token present → let non-admin routes
    through (client-side recovery below); /admin/* still redirects, since role
    can't be confirmed without a verified claim
```

The access token is held **in memory only** (`setAccessToken`/
`getAccessToken` in `api-client.ts`), never `localStorage` — it does not
survive a hard refresh by design; the refresh token cookie recovers the
session silently on the next request.

### Why middleware exists at all, and what it deliberately does not do

Before `middleware.ts` existed, every route-protection check in this codebase
was `"use client"` (a `ProtectedLayout`, `admin/layout.tsx`) — meaning
protection only kicked in after JS loaded and React rendered, and any Server
Component data-fetching on a "protected" page would already have run on the
server before a client-side redirect could ever stop it. `middleware.ts`
verifies the backend-issued JWT directly at the Edge, using the same
`jose`-based verification the backend itself uses to sign the token — this
only works because the backend issues its own JWT rather than depending on
something like Firebase's Admin SDK, which cannot run on the Edge runtime at
all.

Known, deliberate trade-off: the access token cookie is short-lived (~15 min,
matching the backend's `JWT_ACCESS_TTL_SECONDS`), so it can be legitimately
expired mid-session even though the person is still validly logged in via the
long-lived httpOnly refresh token. Rather than have middleware call the
backend's `/auth/refresh` itself on every navigation (extra latency on every
request), an expired/missing access token is allowed through for non-admin
routes if a refresh token cookie is still present — the client-side
`AuthProvider`'s silent refresh and the `api-client.ts` 401-interceptor
handle actual recovery. Real data access is still fully protected regardless
by the backend's own `AccessTokenGuard`/`RolesGuard` on every request —
middleware is a fast, page-load-time first line of defense, not the
authorization boundary.

### CSRF: one interceptor, not two

The only CSRF token attachment lives in `src/shared/lib/api-client.ts`
(`requestInterceptor`, reads the `csrf-token` cookie via `document.cookie`
and attaches `X-CSRF-Token`). It cannot live in `middleware.ts` — `document`
does not exist in the Edge runtime middleware runs in, so an earlier
duplicate CSRF read there could never have worked.

## Project structure

```
src/
├── app/                 App Router pages, route groups: (main)/(public|protected), auth/
│   ├── (main)/(public)/    marketing homepage + /unauthorized — no auth (contact form and API docs page were removed 2026-08-21)
│   ├── (main)/(protected)/ everything behind login
│   │   ├── (client)/          tenant dashboard: payments, transactions, settings, profile
│   │   └── admin/               platform-staff-only: tenants (dashboard, per-tenant API keys), audit logs, transactions
│   └── auth/               login, register, forgot/reset password, verify email
├── modules/              feature code: auth, tenants, onboarding, payments, transactions, admin, home
│   └── <feature>/          *.api.ts (axios calls), *.schema.ts (zod), use*.ts (react-query hooks), components/
├── components/           shadcn-derived primitives + admin sidebar/nav shell
├── shared/                cross-cutting UI/lib code (api-client, utils, layout, email templates)
├── providers/            AuthProvider, QueryProvider
├── config/               env schema (client/server split), site config
└── middleware.ts         Edge-runtime JWT verification for route protection
```

Two corrections to the tree above, both verified against source on 2026-08-29:
the `(client)/api-keys` route and the `modules/api-keys` feature were listed
here but had been deleted on 2026-08-27 (see `CLAUDE.md`); admin key management
lives under `modules/admin/`. Payout UI was added on 2026-08-29 and lives inside
`modules/payments/` and `modules/transactions/` rather than a module of its own,
because collections and payouts share the backend's `transactions` table and
therefore share the list, detail and stats views.

## Transaction direction

`GET /v1/transactions` returns collections **and** payouts — one table backs
both server-side. Anything meaning "money we took in" has to filter
`direction === "INBOUND"` explicitly; the default is not collections-only.

This is not hypothetical. `TransactionStatsCards` originally reduced over every
settled transaction it was handed, so a settled B2C payout was added to *Total
Volume (Settled)* and presented as revenue, and dragged the success rate with
it. Nothing threw — the figure was just wrong. Payout volume is now a separate
card rather than netted off, since "collected 10k" and "collected 10k, sent 7k"
are different facts and one number cannot carry both.

Related consequences worth knowing before touching these views:

- `msisdn` is the payer on `INBOUND` and the **payee** on `OUTBOUND`, so any
  "Paid by" copy has to swap (`TransactionDetailPage` does).
- `POST /v1/dashboard/payments/b2c` is `TENANT_ADMIN`-only — narrower than the
  STK route, which also admits `TENANT_STAFF`. `B2cPayoutSection` hides itself
  for other roles, mirroring the guard rather than replacing it.
- A successful payout POST means Safaricom accepted the request into its queue,
  not that money moved. The form reports `PROCESSING` and polls.

## Environment: why client/server env schemas are split

`src/config/env/clientEnv.ts` validates only `NEXT_PUBLIC_*` browser-safe
vars (`zod`, fails fast on boot if invalid). `src/config/env/serverEnv.ts`
holds server-only values, including `JWT_ACCESS_SECRET` — the same secret
`middleware.ts` uses to verify backend-issued tokens, which must never be
bundled into client JavaScript. Keeping them as two separate schemas rather
than one shared one makes it structurally impossible to accidentally import
a server-only secret into a client component.

`clientEnv.ts` used to require six `NEXT_PUBLIC_FIREBASE_*` variables as
mandatory — the app would refuse to boot without Firebase credentials that
nothing in the code actually read anymore, once auth moved to the backend.
Those were removed entirely along with the rest of the Firebase integration.

## Observability

`@sentry/nextjs`, configured via `next.config.ts`'s `withSentryConfig` and a
`/monitoring` tunnel route (avoids ad-blockers dropping error reports sent
directly to Sentry's domain). `api-client.ts`'s response interceptor reports
API errors to Sentry, but deliberately **scrubs the response body** before
sending: backend validation errors can include field-level details (e.g.
zod's `flatten()` output) for a payment request, and payment requests carry
`msisdn` (a real phone number) and amount — both PII/financial data for a
Kenyan M-Pesa platform. Only the generic message, status code, and *which
field names* failed validation are sent — never the submitted values. 401/403
responses are not reported at all (expected, not exceptional).

## Testing

`npx tsc --noEmit` and `npx eslint .` always work. Running `jest` locally on
Windows additionally requires the Microsoft Visual C++ Redistributable (a
prerequisite for a native addon jest depends on) — a one-time machine setup,
not a project configuration issue.
