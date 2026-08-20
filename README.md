# ScriptPay Frontend

Next.js 16 (App Router, React 19) merchant/admin dashboard for ScriptPay, a multi-tenant M-Pesa (Safaricom Daraja) payment platform. This is a client of the `Script-Pay-Backend` NestJS API — it owns no database and never talks to Safaricom directly. See `docs/architecture.md` for the full request/auth flow.

## Structure

```
src/
├── app/                 App Router pages
│   ├── (main)/(public)/    marketing, contact, API docs — no auth
│   ├── (main)/(protected)/ everything behind login
│   │   ├── (client)/        tenant dashboard: payments, transactions, api-keys, settings
│   │   └── admin/            platform-staff-only: tenants, audit logs, transactions
│   └── auth/               login, register, forgot/reset password, verify email
├── modules/              feature code (api.ts + schema.ts + hooks + components, per feature)
├── components/           shadcn-derived UI primitives, admin sidebar/nav shell
├── shared/                cross-cutting lib code: api-client (axios + interceptors), utils, layout
├── providers/            AuthProvider, QueryProvider
└── middleware.ts         Edge-runtime JWT verification for route protection
```

## Running locally

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```

Requires a running instance of `Script-Pay-Backend` — set `NEXT_PUBLIC_API_URL` to point at it. `JWT_ACCESS_SECRET` **must match the backend's own `JWT_ACCESS_SECRET` exactly** — the Edge middleware verifies the backend-issued JWT itself, using the same shared secret (see `docs/architecture.md`).

## Auth model

Session state is driven entirely by the backend's own JWT/refresh-token pair, not by any client-side auth SDK:
- Access token: held in memory only (never `localStorage`) after login, attached to API requests via an axios interceptor.
- Refresh token: httpOnly cookie, invisible to JavaScript, used to silently recover a session on page load and to transparently retry a request after a `401`.
- Route protection: `middleware.ts` verifies the access token at the Edge before a protected page renders — a fast first line of defense, not the actual authorization boundary, which is enforced by the backend's own guards on every request regardless.

Full detail, including two real bugs found and fixed along the way, in `docs/architecture.md` and `docs/decisions.md`.

## Testing

`npx tsc --noEmit` and `npx eslint .` always work. Running `jest` locally on Windows additionally requires the Microsoft Visual C++ Redistributable to be installed (a prerequisite for a native addon jest depends on) — this is a one-time machine setup, not a project configuration issue.
