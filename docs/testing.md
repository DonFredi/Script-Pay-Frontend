# Testing — ScriptPay Frontend

Current state of the test setup, verified as of 2026-08-21 — not aspirational.

## What's configured

`jest.config.js`: `ts-jest` preset, `jsdom` environment, roots at `src/`,
matches `**/*.spec.ts(x)` and `**/*.test.ts(x)` (excluding `__tests__`
directories), `@/*` path alias mapped to `src/*`. `@testing-library/react`
and `@testing-library/jest-dom` are devDependencies.

`npm test` (→ `jest`) is now wired into `package.json`, alongside `dev`,
`build`, `start`, `lint`.

## What actually has tests today

- `src/modules/auth/shared/hooks/useAuth.spec.tsx` — two cases for the
  `useAuth` hook:
  1. Called outside `AuthProvider` → falls back to `AuthContext`'s default
     (unauthenticated) shape, without throwing.
  2. Called inside a real `AuthProvider` → passes through its context shape
     (`user`, `isAuthenticated`, `setSession`, `clearSession`, `updateUser`)
     unmodified.

  It mocks `@/shared/lib/api-client` entirely (`apiPrivate.get` rejected, so
  `AuthProvider`'s mount-time session rehydration fails immediately and
  settles into the unauthenticated state) — deliberately, per its own
  comment: this test only verifies `useAuth`'s pass-through behavior, not
  `AuthProvider`'s actual login/session-recovery logic, which the comment
  notes belongs in a separate test of `AuthProvider` itself (not yet
  written).

- `src/middleware.spec.ts` — the Edge route-protection logic in
  `middleware.ts`: unprotected routes pass through; a protected route with no
  cookies redirects to `/auth/login?redirect=<path>`; a protected non-admin
  route lets an expired/invalid access token through when a refresh token is
  present (the documented recovery-deferred-to-client tradeoff); `/admin/*`
  redirects to login without a verifiable role claim (no blanket refresh-token
  pass-through, unlike other protected routes) and to `/unauthorized` for a
  verified non-`SUPER_ADMIN` role. Runs real `jose` JWT signing/verification
  against a test secret, and overrides `testEnvironment` to `node` for this
  file (`@jest-environment node` docblock) since `next/server`'s Request/
  Response primitives are Node's, not jsdom's.

- `src/shared/lib/api-client.spec.ts` — `api-client.ts`'s request/response
  interceptors: Authorization header attachment once `setAccessToken` has
  been called, CSRF header attachment from the `csrf-token` cookie on
  state-changing methods only, and the 401 → `/auth/refresh` → retry flow —
  single-flight refresh with a concurrent second 401 queued behind the
  in-flight one rather than triggering its own refresh call, the
  refresh-endpoint-itself and already-retried guards against infinite loops,
  and the failure path (`setAccessToken(null)`, queue cleared, `isRefreshing`
  released so a later 401 can retry). `axios.create()` is mocked to return a
  fake callable instance so the two private interceptor functions can be
  captured from its `interceptors.request.use`/`interceptors.response.use`
  mock calls and invoked directly.

Everything else in `src/` — components, other hooks — has no test coverage
yet.

## What always works without Jest

```bash
npx tsc --noEmit
npx eslint .
```

Both are safe to run in any environment, including CI — see the native-addon
issue below for why `jest` itself doesn't currently share that property on
this machine.

## Windows-specific setup requirement

Running `jest` locally on Windows requires the Microsoft Visual C++
Redistributable. This is a one-time machine setup, not a project
configuration issue; it does not affect `tsc`/`eslint`.

This isn't just about some downstream native addon a particular test might
exercise — as verified 2026-08-21 in this repo's actual environment, it
breaks Jest's own config/preset resolution before a single test file loads.
Jest 30's `jest-resolve` resolves the `ts-jest` preset (and every module
during a real run) through `unrs-resolver`, a native Rust addon; loading its
`.node` binary here throws `Error: Cannot find native binding` — the
platform-specific optional-dependency package
(`@unrs/resolver-binding-win32-x64-msvc`) is present on disk, but its
`.node` binary fails to load with `The specified module could not be found`,
the classic missing-MSVC-runtime-DLL symptom on Windows. The result: `npx
jest` fails immediately with `Preset ts-jest not found relative to rootDir`
— a config-resolution error, not a test failure — even though `require.resolve('ts-jest')`
from plain Node in the same shell succeeds. Installing the redistributable
resolves this at the root; no project-side workaround is expected to.

## Gaps worth knowing about, not fixing speculatively

- No coverage command, no CI enforcement of tests — no `.github/workflows/`
  exists in this repo as of 2026-08-21.
- `middleware.spec.ts` and `api-client.spec.ts` (added 2026-08-21) were
  verified with `tsc --noEmit` and `eslint` only, not an actual `jest` run —
  blocked locally by the native-addon issue above. Run `npx jest` once the
  redistributable is installed to confirm they pass; report back if they
  don't, since they were written from careful reading rather than an
  executed run.
- No test for `AuthProvider`'s actual login/session-recovery logic (only its
  pass-through into `useAuth`, see above).
