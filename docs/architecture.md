# Architecture

## What this is

`Script Pay Frontend` is the merchant/admin dashboard for ScriptPay, a multi-tenant M-Pesa payment platform. It is a **separate repository** from the backend (`Script-Pay-Backend`, NestJS) — this app owns no database and never talks to Safaricom directly. Every payment/transaction/tenant operation goes through the backend's REST API.

This is not a monorepo, there is no `apps/`/`packages/` split, and there is no GraphQL, Kubernetes, or Stripe — an earlier version of this doc described a fictional product that this app never was.

```
Browser
  │
  ▼
Next.js 16 (App Router) — this repo
  ├─ Edge middleware (middleware.ts) — first-pass route protection
  ├─ Server: /api/* rewrites → backend (see next.config.ts)
  └─ Client: axios (api-client.ts) → backend REST API directly
              │
              ▼
      NestJS backend (separate repo) → PostgreSQL, Safaricom Daraja
```

## Real stack

- **Framework**: Next.js 16, App Router, React 19
- **Data fetching**: `@tanstack/react-query` + `axios` (`src/shared/lib/api-client.ts`) — no SWR
- **Forms/validation**: `react-hook-form` + `zod`
- **UI**: shadcn/Radix primitives (`src/components/ui`, `src/shared/components/ui`), Tailwind v4
- **Auth token verification at the edge**: `jose` (the same JWT library the backend uses to sign tokens)
- **Errors/monitoring**: `@sentry/nextjs`
- **Email** (contact form only): `resend` + `@react-email/*`

## Routing structure (`src/app`)

Route groups, not literal URL segments:
- `(main)/(public)/...` — marketing/contact/API docs pages, no auth required
- `(main)/(protected)/...` — everything behind login; `(client)/...` is the tenant-scoped dashboard (payments, transactions, API keys, settings), `admin/...` is platform-staff-only
- `auth/...` — login, register, forgot/reset password, verify email
- `app/api/sentry-example-api` — the only real Next.js API route in this app; everything else is a `next.config.ts` rewrite straight to the backend

## Auth flow

This app does **not** manage sessions itself — it verifies and relays tokens issued by the backend.

1. **Login/signup**: `POST /api/auth/login` (rewritten by `next.config.ts` to the backend's `/auth/login`) returns `{ user, accessToken }` and sets `access_token`/`refresh_token`/`csrf-token` cookies (set by the backend, httpOnly except the CSRF one). `useLogin`'s `onSuccess` calls `AuthProvider`'s `setSession(user, accessToken)`, which stores the access token **in memory only** (a module-level variable in `api-client.ts`) — never `localStorage`, to limit XSS blast radius.
2. **Session recovery on load/reload** (`AuthProvider`): since the access token lives only in memory, a page reload loses it. On mount, `AuthProvider` silently calls `/auth/refresh` (using the httpOnly refresh cookie sent automatically via `withCredentials`), and if that returns a token, fetches `/profile` to repopulate `user`.
3. **Edge middleware** (`middleware.ts`): runs before any Server Component renders on a protected route. It verifies the `access_token` cookie itself with `jose`, using a secret shared with the backend (`JWT_ACCESS_SECRET` must match exactly in both repos). If the access token is missing/expired but a `refresh_token` cookie exists, the request is allowed through — a deliberate tradeoff (the access token is short-lived, ~15 min, so it's routinely expired for a still-valid session) rather than having middleware call the backend to refresh on every navigation. Admin-only routes are the one exception: without a verified role claim, those redirect to login even with a refresh token present. **This middleware is a fast first line of defense, not the only one** — actual data access is still fully enforced by the backend's own guards on every request.
4. **API calls**: `api-client.ts`'s `requestInterceptor` attaches `Authorization: Bearer <token>` (from the in-memory token) and, for mutating requests, an `X-CSRF-Token` header read from the non-httpOnly `csrf-token` cookie. On a `401`, `responseInterceptorError` transparently calls `/auth/refresh`, retries the original request once, and queues any other in-flight requests until the refresh completes — a genuinely expired token doesn't surface as a user-visible error mid-session.

## Module structure (`src/modules`)

Each feature owns its own `*.api.ts` (axios calls), `*.schema.ts` (zod), `use*.ts` (react-query hooks), and `components/`. Real modules: `auth` (login/register/logout/refresh/verify-email/reset-password), `tenants` (M-Pesa credential form), `onboarding`, `payments` (STK Push form + status polling), `transactions`, `api-keys`, `admin` (tenants, transactions, dashboard), `api-docs`, `home`.

`src/shared/` holds cross-cutting UI/lib code used by more than one module; `src/components/` holds the shadcn-derived primitives and the admin sidebar/nav shell.

## Payment status polling

`usePollTransactionStatus` (react-query, polling interval) drives `StkPushSection`'s UI state after a payment is initiated — the frontend never gets a synchronous "it succeeded" response from Safaricom (that's inherently async), so the UI polls `GET /v1/transactions/:id` until the backend's own webhook/drift-detection pipeline resolves the transaction to `SETTLED`/`FAILED`.
