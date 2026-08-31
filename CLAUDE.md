# CLAUDE.md — ScriptPay Frontend

Guidance for Claude Code (or any AI assistant) working in this repository.

## What this project is

The Next.js 16 (App Router, React 19) merchant/admin dashboard for
**ScriptPay**, a multi-tenant M-Pesa (Safaricom Daraja) payment platform.
This repo is standalone — not a monorepo. Its counterpart is a sibling
repository, `Script-Pay-Backend` (NestJS), which owns the database and is
the only thing that talks to Safaricom. This app is a pure API client of
that backend: it owns no database and never calls Safaricom directly.

## Real stack — do not assume otherwise

- **Framework**: Next.js 16, App Router, React 19 — not Pages Router
- **Data fetching**: `@tanstack/react-query` + `axios` (`src/shared/lib/api-client.ts`) — no SWR
- **Forms/validation**: `react-hook-form` + `zod`
- **UI**: shadcn/Radix primitives (`src/components/ui`, `src/shared/components/ui`), Tailwind v4
- **Auth token verification at the edge**: `jose` — the same JWT library the backend uses to sign tokens
- **Errors/monitoring**: `@sentry/nextjs`
- **Email**: `resend` + `@react-email/*` are in the dependency tree but not yet wired up — the contact form that previously called them (`contact/actions/send-contact-email.ts`, `ContactForm.tsx`) was removed 2026-08-21. Kept intentionally (not dead code to remove): planned for sending payment receipt emails to tenants. `src/shared/components/email-template/` holds the existing templates, reusable as a starting point once that feature is built.
- **Payment provider**: Safaricom Daraja, via the backend — no Stripe, no `@stripe/*` dependency

## Request flow

```
Browser
  │
  ▼
Next.js 16 (App Router) — this repo
  ├─ Edge middleware (middleware.ts)  — first-pass route protection. Next.js 16 renamed this convention to `proxy.ts`, but that rename caused a production regression on Vercel (2026-08-23) — reverted, stay on `middleware.ts` until investigated further.
  ├─ Server: SSR/route handlers call the backend's absolute URL directly
  └─ Client: axios (api-client.ts) → same-origin proxy → backend
              │
              ▼
      NestJS backend (separate repo) → PostgreSQL, Safaricom Daraja
```

## Project structure

```
src/
├── app/                 App Router pages, route groups: (main)/(public|protected), auth/
│   ├── (main)/(public)/    marketing homepage + /unauthorized — no auth (contact form and API docs page were removed 2026-08-21)
│   ├── (main)/(protected)/ everything behind login
│   │   ├── (client)/          tenant dashboard: payments, transactions, settings, profile (self-service API-keys page removed 2026-08-27 — see below)
│   │   └── admin/               platform-staff-only: tenants (dashboard, per-tenant API keys), audit logs, transactions
│   └── auth/               login, register, forgot/reset password, verify email
├── modules/              feature code: auth, tenants, onboarding, payments (collections + payouts), transactions, admin (owns api-keys.api.ts/useTenantApiKeys.ts — list/revoke/create, see below), home
│   └── <feature>/          *.api.ts (axios calls), *.schema.ts (zod), use*.ts (react-query hooks), components/
├── components/           shadcn-derived primitives + admin sidebar/nav shell
├── shared/                cross-cutting UI/lib code (api-client, utils, layout, email templates)
├── providers/            AuthProvider, QueryProvider
├── config/               env schema (client/server split), site config
└── middleware.ts         Edge-runtime JWT verification for route protection
```

There is no `apps/`, no `packages/`, no `k8s/`. Real endpoint documentation lives in the backend repo's `CLAUDE.md`/`README.md` — don't duplicate it here.

**Tenant self-service API-keys page removed (2026-08-27)**: the backend's `TenantsService.updateStatus` now auto-provisions a default-scoped API key the moment a tenant is activated and emails the raw key to every `TENANT_ADMIN` (see `Script-Pay-Backend`'s `docs/decisions.md` entry 14) — `POST/GET/DELETE /v1/api-keys` still exist and work exactly as before, but a self-service UI in front of them is no longer a required (or expected) part of onboarding. `src/modules/api-keys/` and `app/(main)/(protected)/(client)/api-keys/` were deleted accordingly, along with their nav entry and `middleware.ts` protected prefix. `SUPER_ADMIN` oversight (list/revoke any tenant's keys via `?tenantId=`) is a separate capability and is untouched — it still lives under `src/modules/admin/` (`api-keys.api.ts`, `useTenantApiKeys.ts`) and `app/(main)/(protected)/admin/`.

**Key creation added back on the admin side (2026-08-29)**: the note above described admin as list/revoke only, which stopped being true when payouts landed. The `PAYMENTS_DISBURSE` scope is deliberately excluded from the auto-provisioned default set, so with no create form the only way to enable payouts for a tenant was calling the API by hand. `CreateApiKeyForm.tsx` (under `src/modules/admin/api-keys/`) issues a key with a chosen scope set and shows the raw key exactly once. This is still **not** the deleted tenant self-service page — it is platform staff acting on a tenant's behalf, same as list/revoke. `API_KEY_SCOPES` in `api-keys.api.ts` mirrors the backend's Prisma enum by hand; a scope added there must be added here before it can be requested.

**Payouts / transaction direction (2026-08-29)**: the backend can now send money out (Daraja B2C), and payouts live in the **same** `transactions` table as collections — so `GET /v1/transactions` returns **both** unless `direction` is passed. This is the single easiest thing to get wrong here: any figure meaning "money we took in" must filter on `direction === "INBOUND"` first. It has already caused one real defect — `TransactionStatsCards` summed every settled row and reported a settled payout as revenue. `Transaction` carries `direction` (`INBOUND`/`OUTBOUND`) and the `B2C` channel; `msisdn` is the payer on a collection and the **payee** on a payout, so copy that says "Paid by" has to swap. The payout form (`payments/sections/B2cPayoutSection.tsx`) is `TENANT_ADMIN`-only, mirroring the route's `@Roles("TENANT_ADMIN")` — narrower than the STK route on purpose, since disbursing drains the tenant's own balance. A successful POST means Safaricom **queued** the request, not that money moved, so it reports `PROCESSING` and polls. See `Script-Pay-Backend`'s `docs/decisions.md` entries 15-18.

**Default shortcode per type (2026-08-31)**: a tenant can hold multiple shortcodes of the same `type` (e.g. two `PAYBILL`s); `MpesaCredentialsForm.tsx`'s "Make default" action and the add-shortcode form's `isDefault` checkbox call `useSetDefaultShortcode`/`useCreateShortcode` (`useTenantShortcodes.ts`), which also unset any other default of that same type client-side after the mutation (`unsetOtherDefaults`) since the backend's `findFirst({ isDefault: true })` lookup would otherwise be nondeterministic with two. The backend enforces the same one-default-per-type rule server-side in the same transaction as the write — see `Script-Pay-Backend`'s `docs/decisions.md` entry 20.

**Dashboard shell + receipt printing (2026-08-31)**: the sidebar (`components/ui/sidebar.tsx`) is pinned open and non-toggleable at the `lg` breakpoint (1024px+) — only tablet and mobile keep the toggle (`useIsLargeScreen`/`useIsMobile` in `hooks/use-mobile.ts`). Printing a settled transaction's receipt (`TransactionDetailPage.tsx`) no longer shows the dashboard nav as its heading — `SiteHeader` and `Sidebar` are `print:hidden` now, and the receipt itself gets a `ReceiptLetterhead` placeholder (swap for the real ScriptPay/ScriptTagg logos when available).

## Auth model

Session state is driven entirely by the backend's own JWT/refresh-token pair — no client-side auth SDK:

- **Access token**: held in memory only (`setAccessToken`/`getAccessToken` in `api-client.ts`), never `localStorage`. Attached via an axios request interceptor as `Authorization: Bearer`.
- **Refresh token**: httpOnly cookie, invisible to JS. `api-client.ts`'s response interceptor catches a `401`, calls `/auth/refresh` once (queuing concurrent requests behind the same in-flight refresh), and retries the original request. A refresh that resolves HTTP 200 with `accessToken: null` (the backend's "no valid session" shape) counts as a failure, not a success (fixed 2026-08-31 — see `docs/decisions.md` entry 9): it clears the token and dispatches a `window` `"auth:session-expired"` event, which `AuthProvider` uses to `clearSession()` and let the existing redirect-when-unauthenticated logic send the user back to login, instead of leaving them stuck on a page that can never load data again.
- **CSRF**: the backend sets a non-httpOnly `csrf-token` cookie on login/signup; `api-client.ts` reads it via `document.cookie` and attaches it as `X-CSRF-Token` on POST/PUT/PATCH/DELETE. This is the *only* CSRF interceptor — don't add another one in `middleware.ts`, `document` doesn't exist in the Edge runtime middleware runs in.
- **Route protection (`middleware.ts`)**: verifies the `access_token` cookie with `jose` at the Edge — `JWT_ACCESS_SECRET` here **must be byte-for-byte identical** to the backend's own `JWT_ACCESS_SECRET`. If the access token is missing/expired but a `refresh_token` cookie is present, non-admin protected routes are let through (the client-side silent refresh recovers); `/admin/*` routes still redirect without a verified role claim. This is a fast first line of defense, not the authorization boundary — the backend's own guards enforce that on every request regardless.

## Environment

Two separate env schemas — `src/config/env/clientEnv.ts` (browser-safe, `NEXT_PUBLIC_*`) and `src/config/env/serverEnv.ts` (server-only, includes `JWT_ACCESS_SECRET`). Check `.env.example` for the current full list before assuming a variable name.

## Running locally

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```

Requires a running instance of `Script-Pay-Backend`.

## Testing note

Running `jest` locally on Windows requires the Microsoft Visual C++ Redistributable (a native-addon dependency needs it) — a machine prerequisite, not a project configuration issue. `npx tsc --noEmit` and `npx eslint .` don't have this dependency and always work.

## Further docs

This file and `README.md` are the fast-orientation layer. For depth, see
`docs/` (regenerated 2026-08-21, verified against source — see "What to
avoid" below for why that matters here specifically):

- `docs/architecture.md` — request lifecycle (login → cookies → interceptors
  → middleware), why the same-origin `/api/backend` proxy exists, project
  structure, environment split, observability.
- `docs/decisions.md` — ADR log: each entry states the problem, the choice
  made, and *why the rejected alternative didn't fit* (e.g. why the access
  token is in-memory not localStorage, why a same-origin proxy instead of
  calling the backend directly).
- `docs/security.md` — session/token handling, what gets sent to Sentry
  (and what's scrubbed), what this app deliberately does not do (all real
  authorization is the backend's job).
- `docs/testing.md` — what's actually tested today (one hook, `useAuth`),
  the Windows Jest prerequisite, and the honest gap list (no `test` script
  wired into `package.json` yet).

One project-specific skill lives in `.claude/skills/`: `add-feature-module`
(the `modules/<feature>/` file convention, wiring a new call through
`api-client.ts` correctly, registering a new protected route in
`middleware.ts`) — reach for it before adding a new feature area from
scratch.

## What to avoid

- Don't invent Stripe/card terminology for this product — it's mobile money (M-Pesa), not card processing.
- Don't put the access token in `localStorage` — it's deliberately in-memory only.
- Don't add CSRF logic to `middleware.ts` — the one real CSRF interceptor lives in `src/shared/lib/api-client.ts`; `document` doesn't exist in the Edge runtime.
- Don't rename `middleware.ts` to `proxy.ts` (Next.js 16's newer convention) without first confirming Vercel deploys it correctly — doing so on 2026-08-23 caused protected routes (including plain static ones like `/dashboard`) to start 500ing in production, while working fine in `next dev` and in a local `next build && next start`. Reverted; revisit only with a real repro plan, not as an incidental cleanup.
- Don't assume a bare `/auth/:path*`-style rewrite reaches the backend directly — Next's filesystem router wins over rewrites for any path that's also a real page; check `next.config.ts` for the actual proxy setup before assuming.
- Don't treat anything under `.claude/prompts`, `.claude/skills`, or old `docs/*.md` commit history from before 2026-08-20 as still valid — the ORIGINAL versions were deleted that day because they described a nonexistent `scriptpay-agent` CLI and other fictional/hallucinated tooling. A new `docs/` and a new `.claude/skills/add-feature-module.md` were written the same day (see "Further docs" above), verified claim-by-claim against actual source rather than carried over — treat those, plus this file and `README.md`, as current. Keep verifying against actual source before extending any of it further; this repo has already paid for that mistake once.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
