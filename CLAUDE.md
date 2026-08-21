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
- **Email** (contact form only): `resend` + `@react-email/*`
- **Payment provider**: Safaricom Daraja, via the backend — no Stripe, no `@stripe/*` dependency

## Request flow

```
Browser
  │
  ▼
Next.js 16 (App Router) — this repo
  ├─ Edge middleware (middleware.ts)  — first-pass route protection
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
│   ├── (main)/(public)/    marketing, contact, API docs — no auth
│   ├── (main)/(protected)/ everything behind login
│   │   ├── (client)/          tenant dashboard: payments, transactions, api-keys, settings, profile
│   │   └── admin/               platform-staff-only: tenants (dashboard), audit logs, transactions
│   └── auth/               login, register, forgot/reset password, verify email
├── modules/              feature code: auth, tenants, onboarding, payments, transactions, api-keys, admin, api-docs, home
│   └── <feature>/          *.api.ts (axios calls), *.schema.ts (zod), use*.ts (react-query hooks), components/
├── components/           shadcn-derived primitives + admin sidebar/nav shell
├── shared/                cross-cutting UI/lib code (api-client, utils, layout, email templates)
├── providers/            AuthProvider, QueryProvider
├── config/               env schema (client/server split), site config
└── middleware.ts         Edge-runtime JWT verification for route protection
```

There is no `apps/`, no `packages/`, no `k8s/`. Real endpoint documentation lives in the backend repo's `CLAUDE.md`/`README.md` — don't duplicate it here.

## Auth model

Session state is driven entirely by the backend's own JWT/refresh-token pair — no client-side auth SDK:

- **Access token**: held in memory only (`setAccessToken`/`getAccessToken` in `api-client.ts`), never `localStorage`. Attached via an axios request interceptor as `Authorization: Bearer`.
- **Refresh token**: httpOnly cookie, invisible to JS. `api-client.ts`'s response interceptor catches a `401`, calls `/auth/refresh` once (queuing concurrent requests behind the same in-flight refresh), and retries the original request.
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
- Don't assume a bare `/auth/:path*`-style rewrite reaches the backend directly — Next's filesystem router wins over rewrites for any path that's also a real page; check `next.config.ts` for the actual proxy setup before assuming.
- Don't treat anything under `.claude/prompts`, `.claude/skills`, or old `docs/*.md` commit history from before 2026-08-20 as still valid — the ORIGINAL versions were deleted that day because they described a nonexistent `scriptpay-agent` CLI and other fictional/hallucinated tooling. A new `docs/` and a new `.claude/skills/add-feature-module.md` were written the same day (see "Further docs" above), verified claim-by-claim against actual source rather than carried over — treat those, plus this file and `README.md`, as current. Keep verifying against actual source before extending any of it further; this repo has already paid for that mistake once.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
