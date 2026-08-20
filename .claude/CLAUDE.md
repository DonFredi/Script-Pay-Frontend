# Claude Integration Guide — ScriptPay Frontend

This file previously contained a generic template describing a different, fictional product (Stripe payments, GraphQL, `apps/`+`packages/` monorepo, Kubernetes). None of that matched this repository. Rewritten to describe what's actually here.

## What this project is

The Next.js 16 (App Router, React 19) merchant/admin dashboard for **ScriptPay**, a multi-tenant M-Pesa (Safaricom Daraja) payment platform for the Kenyan market. This repo is standalone — not part of a monorepo. Its counterpart is a separate repository, `Script-Pay-Backend` (NestJS), which owns the database and is the only thing that talks to Safaricom. This app is a pure API client of that backend.

See `docs/architecture.md` for the full routing/auth/module structure, `docs/security.md` for real frontend-specific security measures, `docs/decisions.md` for real decisions and their rationale (including two real bugs that were found and fixed: a broken Firebase-listener auth pattern, and a routing collision that broke every login).

## Real stack

- **Framework**: Next.js 16, App Router, React 19 — not Next.js 14, no Pages Router
- **Data fetching**: `@tanstack/react-query` + `axios` — no SWR
- **Payment provider**: Safaricom Daraja (via the backend) — no Stripe, `@stripe/react-stripe-js` is not a dependency
- **Auth**: consumes the backend's own JWT (`jose` to verify at the Edge); no Firebase client SDK involvement in session state
- **Styling**: Tailwind v4 + shadcn/Radix — no separate CSS-in-JS system

## Real project structure

```
src/
├── app/                 App Router pages, route groups: (main)/(public|protected), auth/
├── modules/              feature code: auth, tenants, onboarding, payments, transactions, api-keys, admin, api-docs, home
│   └── <feature>/        *.api.ts (axios), *.schema.ts (zod), use*.ts (react-query hooks), components/
├── components/           shadcn-derived primitives + admin sidebar/nav shell
├── shared/                cross-cutting UI/lib code (api-client, utils, layout components)
├── providers/            AuthProvider, QueryProvider
├── config/               env schema, client/server config
└── middleware.ts         Edge-runtime JWT verification for route protection
```

There is no `apps/`, no `packages/`, no `k8s/`. Real endpoint documentation lives in the backend repo's `docs/api.md`, not here — don't duplicate it here again.

## Testing note

Running `jest` locally on Windows requires the Microsoft Visual C++ Redistributable to be installed (a native-addon dependency, `unrs-resolver`, needs it) — this is a machine prerequisite, not a project configuration issue. `npx tsc --noEmit` and `npx eslint .` do not have this dependency and always work.

## What to avoid

- Don't invent Stripe/card terminology for this product — it's mobile money (M-Pesa), not card processing.
- Don't put the access token in `localStorage` — it's deliberately in-memory only (see `docs/decisions.md`, ADR-003).
- Don't add CSRF logic to `middleware.ts` — the one real CSRF interceptor lives in `src/shared/lib/api-client.ts` (see `docs/decisions.md`, ADR-004); `document` doesn't exist in the Edge runtime middleware runs in.
- Don't assume a bare `/auth/:path*`-style rewrite will reach the backend — Next's filesystem router wins over rewrites for any path that's also a real page (see `docs/decisions.md`, ADR-002).
