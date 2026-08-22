# ScriptPay Frontend

Next.js 16 (App Router, React 19) merchant/admin dashboard for ScriptPay, a
multi-tenant M-Pesa (Safaricom Daraja) payment platform. Pure API client of
the `Script-Pay-Backend` NestJS API — it owns no database and never talks to
Safaricom directly.

## Structure

```
src/
├── app/                 App Router pages
│   ├── (main)/(public)/    marketing homepage + /unauthorized — no auth
│   ├── (main)/(protected)/ everything behind login
│   │   ├── (client)/        tenant dashboard: payments, transactions, api-keys, settings, profile
│   │   └── admin/             platform-staff-only: tenants, audit logs, transactions
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

Requires a running instance of `Script-Pay-Backend` — point the API base URL
env var at it. `JWT_ACCESS_SECRET` **must match the backend's own
`JWT_ACCESS_SECRET` exactly** — the Edge middleware verifies the
backend-issued JWT itself, using the same shared secret.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm run start` | production build/run |
| `npm run lint` | eslint |

## Auth model

Session state is driven entirely by the backend's own JWT/refresh-token pair, not by any client-side auth SDK:

- **Access token**: held in memory only (never `localStorage`) after login, attached to API requests via an axios interceptor.
- **Refresh token**: httpOnly cookie, invisible to JavaScript, used to silently recover a session on page load and to transparently retry a request after a `401`.
- **Route protection**: `middleware.ts` verifies the access token at the Edge before a protected page renders — a fast first line of defense, not the actual authorization boundary, which the backend's own guards enforce on every request regardless.

Full detail in `CLAUDE.md`.

## Testing

`npx tsc --noEmit` and `npx eslint .` always work. Running `jest` locally on
Windows additionally requires the Microsoft Visual C++ Redistributable
(a prerequisite for a native addon jest depends on) — a one-time machine
setup, not a project configuration issue.
