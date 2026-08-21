# Testing — ScriptPay Frontend

Current state of the test setup, verified as of 2026-08-21 — not aspirational.

## What's configured

`jest.config.js`: `ts-jest` preset, `jsdom` environment, roots at `src/`,
matches `**/*.spec.ts(x)` and `**/*.test.ts(x)` (excluding `__tests__`
directories), `@/*` path alias mapped to `src/*`. `@testing-library/react`
and `@testing-library/jest-dom` are devDependencies.

**There is no `test` script in `package.json`** — only `dev`, `build`,
`start`, `lint`. Jest and its dependencies are installed and configured, but
`npm test` does not currently work; run Jest directly instead:

```bash
npx jest
```

## What actually has tests today

One spec file exists: `src/modules/auth/shared/hooks/useAuth.spec.tsx`. It
covers two cases for the `useAuth` hook:

1. Called outside `AuthProvider` → falls back to `AuthContext`'s default
   (unauthenticated) shape, without throwing.
2. Called inside a real `AuthProvider` → passes through its context shape
   (`user`, `isAuthenticated`, `setSession`, `clearSession`, `updateUser`)
   unmodified.

It mocks `@/shared/lib/api-client` entirely (`apiPrivate.get` rejected, so
`AuthProvider`'s mount-time session rehydration fails immediately and settles
into the unauthenticated state) — deliberately, per its own comment: this
test only verifies `useAuth`'s pass-through behavior, not
`AuthProvider`'s actual login/session-recovery logic, which the comment notes
belongs in a separate test of `AuthProvider` itself (not yet written).

Everything else in `src/` — components, other hooks, `middleware.ts`,
`api-client.ts`'s interceptor logic — has no test coverage yet.

## What always works without Jest

```bash
npx tsc --noEmit
npx eslint .
```

Neither depends on the native addon below, so both are safe to run in any
environment, including CI, without the machine prerequisite.

## Windows-specific setup requirement

Running `jest` locally on Windows requires the Microsoft Visual C++
Redistributable — a native addon one of Jest's dependencies needs at runtime.
This is a one-time machine setup, not a project configuration issue; it does
not affect `tsc`/`eslint`.

## Gaps worth knowing about, not fixing speculatively

- No test script wired into `package.json` (see above) — anyone running
  `npm test` gets an npm error, not test output.
- No coverage command, no CI enforcement of tests — no `.github/workflows/`
  exists in this repo as of 2026-08-21.
- No test for `middleware.ts`'s Edge-runtime JWT verification logic, despite
  it being the first line of route protection (see `docs/architecture.md`).
- No test for `api-client.ts`'s 401-refresh-retry interceptor, despite it
  being the mechanism that recovers a session after access-token expiry.
