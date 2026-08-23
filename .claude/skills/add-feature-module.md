---
name: add-feature-module
description: Use when adding a new feature area to this Next.js app (a new dashboard section, a new API integration) — covers the modules/<feature> file convention, wiring a new API call through api-client correctly, and registering a new protected route in proxy.ts.
---

# Adding a new feature module in ScriptPay Frontend

Every feature under `src/modules/` (auth, tenants, payments, transactions,
api-keys, ...) follows the same internal shape. Follow it rather than
inventing a new structure per feature — the whole point is that any feature
directory looks the same from the outside.

## 1. File layout

```
src/modules/<feature>/
├── <feature>.api.ts       axios calls against the backend, using `api`/`apiPrivate` from
│                            src/shared/lib/api-client — never a raw axios instance
├── <feature>.schema.ts    zod schemas + z.infer types, matching the backend's DTO shape
│                            (check the backend repo's docs/api.md for the exact contract)
├── use<Thing>.ts           react-query hooks (useQuery/useMutation) wrapping the .api.ts calls
└── components/             feature-specific UI
```

## 2. Calling the backend

Import `api` or `apiPrivate` from `@/shared/lib/api-client` — both already
have `withCredentials: true`, the `Authorization: Bearer` interceptor, the
CSRF header interceptor, and the 401-refresh-retry interceptor wired up.
**Do not** create a new axios instance, add your own CSRF header logic, or
manually attach the access token — all of that already happens for every
request through these two clients. Use `apiPrivate` for calls that should
bypass the automatic 401-refresh-retry loop (the refresh call itself,
anything called from inside `AuthProvider`'s own rehydration logic); `api`
for everything else.

Paths are relative (`"/v1/transactions"`, not an absolute URL) — the
`baseURL` on both clients already resolves to the same-origin
`/api/backend` proxy in the browser and the backend's absolute URL on the
server (see `docs/architecture.md` for why calling the backend's absolute
URL directly from the browser breaks CSRF/session cookies silently).

## 3. Validating data

Define a zod schema in `<feature>.schema.ts` and export the inferred type —
same pattern as the backend's own DTOs, so the shape is easy to cross-check
against `docs/api.md` in the backend repo. Use it to parse/validate form
input with `react-hook-form` + `@hookform/resolvers`, matching the existing
modules.

## 4. If the feature needs a protected route

Add the new path prefix to **both** arrays in `src/middleware.ts`:

```ts
const PROTECTED_PREFIXES = [..., "/your-new-section"];
// only if platform-staff-only:
const ADMIN_ONLY_PREFIXES = [..., "/your-new-section"];
```

And to the `matcher` array in the same file's `export const config`. A page
under `app/(main)/(protected)/` that isn't also listed in
`PROTECTED_PREFIXES` gets no Edge-level protection — it would still be
gated by the backend's own guards on any data request, but the fast
first-line-of-defense middleware wouldn't cover it (see
`docs/decisions.md` entry 1 for why that gap matters).

## 5. Update the docs

If the new module introduces a new pattern worth remembering (a new kind of
guard interaction, a new deliberate trade-off), add it to
`docs/architecture.md` or a new entry in `docs/decisions.md` — don't leave
non-obvious reasoning only in a code comment no one will find later.
