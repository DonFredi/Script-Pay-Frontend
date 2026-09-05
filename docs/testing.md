# Testing — ScriptPay Frontend

Current state of the test setup, verified as of 2026-08-25 — not aspirational.

## What's configured

`jest.config.js`: `ts-jest` preset, `jsdom` environment, roots at `src/`,
matches `**/*.spec.ts(x)` and `**/*.test.ts(x)` (excluding `__tests__`
directories), `@/*` path alias mapped to `src/*`, `setupFilesAfterEnv:
["<rootDir>/jest.setup.ts"]` (added 2026-08-25 — just `import
"@testing-library/jest-dom"`, so `toBeInTheDocument()` etc. are available in
every spec without a per-file import). `@testing-library/react` and
`@testing-library/jest-dom` are devDependencies.

`npm test` (→ `jest`) and `npm run test:coverage` (→ `jest --coverage`) are
wired into `package.json`, alongside `dev`, `build`, `start`, `lint`.

`.github/workflows/ci.yml` (added 2026-08-25) runs on every push to `main`
and every PR: `tsc --noEmit` + `eslint .` in one job, `npm run test:coverage`
in another, and a full `next build` (with dummy `NEXT_PUBLIC_*` values — see
the workflow file's comments — no real secrets needed to validate a build) in
a third. This closes the "no CI enforcement" gap this file used to document.

The `build` job's first real run (32862300604, 2026-08-25) failed at `npx
next build` with `Cannot find module '@tailwindcss/postcss'` — its `env:`
block (the dummy `NEXT_PUBLIC_*` values, plus a redundant `NODE_ENV:
production`) was set at job level, so it also applied to the `npm ci` step
before it; `NODE_ENV=production` makes npm skip `devDependencies` (1216
packages installed in the unaffected `typecheck-and-lint` job's `npm ci` vs.
397 in `build`'s), and `@tailwindcss/postcss` — needed by the Tailwind v4
PostCSS pipeline — is a devDependency. Fixed same day by moving that `env:`
block down to just the `npx next build` step, so `npm ci` installs
everything it needs; `next build` sets `NODE_ENV=production` itself
regardless. Confirmed fixed: run 32869218950 passed all three jobs.

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
  `AuthProvider`'s actual login/session-recovery logic, which is covered
  separately below.

- `src/providers/AuthProvider.spec.tsx` (added 2026-08-25) — the actual
  rehydration/session logic `useAuth.spec.tsx` deliberately doesn't touch:
  mount-time silent refresh succeeding (`POST /auth/refresh` → access token
  → `GET /profile` → user set, `isAuthenticated` true), refresh returning no
  access token (settles unauthenticated, `/profile` never called), refresh
  itself rejecting (`setAccessToken(null)`, unauthenticated, no thrown
  error), and `setSession`/`clearSession`/`updateUser` each doing exactly
  what they claim (`updateUser` in particular must not touch the access
  token — see its comment in `AuthProvider.tsx`). A test added 2026-08-31
  covers the other trigger for `clearSession`: `api-client.ts` dispatching
  `window`'s `"auth:session-expired"` event when a refresh definitively
  fails mid-session (see `docs/decisions.md` entry 9) — asserts the listener
  actually logs the user out, not just that it's registered.

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
  released so a later 401 can retry). Two cases added 2026-08-31 close the
  gap that let a real bug through (see `docs/decisions.md` entry 9): a
  refresh that resolves HTTP 200 with `accessToken: null` is asserted to
  reject (not silently retry with no auth header), and a definitive refresh
  failure is asserted to dispatch `window`'s `"auth:session-expired"` event
  exactly once. `axios.create()` is mocked to return a fake callable instance
  so the two private interceptor functions can be captured from its
  `interceptors.request.use`/`interceptors.response.use` mock calls and
  invoked directly.

- `src/modules/auth/login/useLogin.spec.tsx`, `useRegister.spec.tsx`,
  `useLogout.spec.tsx` (added 2026-08-25) — the three auth mutation hooks
  themselves, mocking their respective `*.api.ts` module and
  `useAuthContext` so each test isolates just the hook's own
  success/error handling: `useLogin`/`useRegister` call `setSession` on
  success and never on failure (the real regression this guards against:
  `useLogin.ts` had this call commented out at one point, so login
  "succeeded" but `isAuthenticated` never flipped true — see its own
  comment); `useLogout` calls `clearSession` and clears the shared
  `queryClient` on *both* success and failure, since a person who clicks
  "log out" expects to end up logged out locally even if the network call
  fails.

- `src/modules/payments/usePollTransactionStatus.spec.tsx` (added
  2026-08-25) — the payment-critical polling logic: which
  `TransactionStatus` values are terminal (`SETTLED`, `FAILED`,
  `REVERSED` — polling stops) vs not (`PENDING`, `PROCESSING` — polling
  continues every 2.5s), verified with fake timers so a wrong entry in
  `TERMINAL_STATUSES` would show up as either polling a settled payment
  forever or freezing on one still in flight.

- `src/modules/transactions/useTransactions.spec.tsx` (added 2026-08-25)
  — `useTransactions`'s mapping of react-query state onto
  `{transactions, loading, error}` (including the `?? []` default and the
  `Error → string | null` mapping) and that `tenantId`/`status` are
  forwarded to `listTransactions` unchanged; `useTransaction`'s
  enabled-only-with-an-id gating.

- `src/modules/transactions/components/TransactionStatsCards.spec.tsx`
  (added 2026-08-29) — that collections and payouts stay separated in the
  dashboard figures. Payouts arrive in the same list as collections
  (`GET /v1/transactions` returns both), and this component previously
  reduced over all of it, so a settled payout was added to *Total Volume*
  and reported as revenue. The tests pin that payout amounts are excluded
  from collected volume, reported in their own card rather than netted off,
  and that a failed payout cannot move the collection success rate.
  Amounts are asserted on the numeric portion only: `Intl` renders KES as
  "Ksh" separated by a non-breaking space whose codepoint varies with the
  ICU build, so matching the full formatted string fails for reasons
  unrelated to the component.

- `src/modules/auth/forgot-password/useForgotPassword.spec.tsx`,
  `resend-verification/useResendVerification.spec.tsx`,
  `reset-password/useResetPassword.spec.tsx`,
  `verify-email/useVerifyEmail.spec.tsx` (added 2026-08-25) — the four
  near-identical single-purpose auth mutations: each calls its `*.api.ts`
  function and shows a success or error toast, nothing else. `useMe.spec.tsx`
  (added 2026-08-25) covers `useMe`'s query config — no retry on failure.

- `src/modules/onboarding/useOnboardTenant.spec.tsx` (added 2026-08-25) —
  per its own comment, `onboardTenant.api.ts` already refreshes the access
  token itself; this hook's own job is re-fetching the profile afterward and
  calling `updateUser` (never `setSession`, which would touch the token) so
  the in-memory user picks up its new `tenantId`.

- `admin/useTenants.spec.tsx`, `admin/useTenantApiKeys.spec.tsx` (added
  2026-08-25) — the query + mutation hook sets for admin tenant management
  and admin per-tenant API key oversight. (A third spec in this batch,
  `src/modules/api-keys/useApiKeys.spec.tsx`, covered the tenant
  self-service API-keys hooks; removed 2026-08-27 along with the rest of
  `src/modules/api-keys/` when that page was deleted — see `CLAUDE.md`.)
  Each mutation spec
  renders its `useQuery` and `useMutation` hooks together against a shared
  `QueryClient` and asserts the list query actually refetches after
  `invalidateQueries` — not just that the mutation itself resolved. (The
  `useUpdateTenantStatus` test found a minor real inefficiency this way:
  its two `invalidateQueries` calls both end up matching the tenant-detail
  query, since react-query matches by key *prefix* — `["admin","tenants"]`
  matches `["admin","tenants",id]` too — so it refetches twice instead of
  once. Not a correctness bug, just a redundant request; the test asserts
  `>= 2` rather than an exact count to reflect that honestly.)

- `src/modules/tenants/useMpesaCredentials.spec.tsx` (added 2026-08-25) —
  `useSetMpesaCredentials`'s tenantId binding and toast wiring. Flagged as
  payment-config-critical: wrong credentials silently "saved" here means
  every subsequent STK push fails downstream, with no other test catching it.

- `src/modules/payments/sections/StkPushSection.spec.tsx` (added
  2026-08-25) — the actual money-movement trigger, and the one gap
  explicitly called out after the first hook-testing pass. Mocks
  `initiateStkPush` and `usePollTransactionStatus` (the latter already
  covered on its own) to isolate what only lives inline in this component:
  normalizing a `07XX` phone number to Daraja's `2547XX` format, converting
  a KES amount typed by the user into integer minor units
  (`amountMinorUnits`), mapping the Paybill/Till toggle to the right
  `channel` value and account reference, and the polled-status → UI-state
  mapping (`SETTLED` → success message, `FAILED`/`REVERSED` → shows
  `failureReason`). Uses `fireEvent` rather than `@testing-library/user-event`
  (not currently a project dependency) — sufficient here since the inputs
  are plain controlled `register()` fields, not anything needing realistic
  keystroke sequencing.

- `src/modules/payments/sections/B2cPayoutSection.spec.tsx` (added
  2026-09-05) — the money-*out* form, flagged as the remaining gap after the
  pre-go-live audit: it was the only payment form without a spec, and it is
  the riskier of the two (a bad collection costs a customer a retry; a bad
  payout sends real money from the tenant's own balance to the wrong person,
  possibly twice). Mirrors `StkPushSection.spec.tsx`'s setup, plus mocks for
  `useBalance`, `useTenantShortcodes` and `useAuthContext`. Covers what only
  lives inline here: the `TENANT_ADMIN` gate rendering `null` for anyone else,
  phone normalization and minor-units conversion, shortcode selection when the
  tenant has exactly one B2C shortcode (and the submit block when they have
  none), the polled-status → UI mapping including the "funds have been
  returned" fallback when `failureReason` is null and the "do not resend"
  warning when polling gives up — and, with no counterpart on the collection
  side, the idempotency key's lifecycle: held across a retry of a failed
  payout, rotated once one is accepted. That key is the only thing between a
  resubmitted form and a second real disbursement.

  `crypto.randomUUID` is stubbed with a sequential fake (jsdom doesn't
  reliably provide it, and a deterministic key is what makes the lifecycle
  assertable). Key rotation is asserted through that stub's call count rather
  than by submitting a second payout: a successful submit calls `reset()`,
  and react-hook-form re-registers its fields asynchronously, so the first
  field written after a reset is silently dropped — a test artifact, not a
  component bug, and not worth encoding a workaround for.

Everything else in `src/` — most components (tables, admin pages, forms
other than the two payment sections), and modules with no dedicated hook
(`audit-logs.api.ts`'s `listAuditLogs`, called directly from
`app/(main)/(protected)/admin/audit-logs/page.tsx`) — has no test coverage
yet.

Two small pieces of dead code were found while surveying this, worth a
cleanup pass on their own rather than folded into a testing changeset:
`src/modules/auth/refresh/refresh.api.ts`'s `refresh()` function has no
importers anywhere (`AuthProvider.tsx` calls `apiPrivate.post("/auth/refresh")`
directly instead), and `src/modules/payments/StkFormData.ts` is an orphaned,
out-of-sync duplicate of the type `StkPushSection.tsx` actually uses (the
real one is `StkFormData` inferred from `stkPush.schema.ts`'s zod schema,
imported from `../stkPush.schema`, not from this file).

## Coverage

`jest.config.js`'s `coverageThreshold` enforces per-file minimums (set a
little under actual coverage, so a real regression fails CI), scoped to the
files listed above under "What actually has tests today." There's no
repo-wide `collectCoverageFrom` and no repo-wide threshold — see the comment
block at the top of `jest.config.js` for why a blanket one was considered and
rejected (instrumenting every file under `src/` means `require`-ing files
never otherwise loaded in a test context, e.g. `clientEnv.ts` throws on
invalid/missing env at module load, which risks breaking coverage collection
itself rather than just reporting a low number). The "All files" summary
`jest --coverage` prints reflects only the tested paths, not overall project
coverage — don't read it as "the app is ~90% tested."

## What always works without Jest

```bash
npx tsc --noEmit
npx eslint .
```

Both are safe to run in any environment, including CI.

## Windows-specific setup requirement

Running `jest` locally on Windows requires the Microsoft Visual C++
Redistributable. This is a one-time machine setup, not a project
configuration issue; it does not affect `tsc`/`eslint`.

This isn't just about some downstream native addon a particular test might
exercise — as verified 2026-08-21 in this repo's environment at the time, it
can break Jest's own config/preset resolution before a single test file
loads: Jest 30's `jest-resolve` resolves the `ts-jest` preset (and every
module during a real run) through `unrs-resolver`, a native Rust addon;
without the redistributable, loading its `.node` binary throws `Error:
Cannot find native binding` even though the platform-specific optional
dependency package (`@unrs/resolver-binding-win32-x64-msvc`) is present on
disk — the classic missing-MSVC-runtime-DLL symptom. The result: `npx jest`
fails immediately with `Preset ts-jest not found relative to rootDir` — a
config-resolution error, not a test failure. As of 2026-08-25, `jest` runs
cleanly on this machine (the redistributable is present here), but this
remains a real per-machine prerequisite for anyone else hitting the same
symptom — installing the redistributable resolves it at the root; no
project-side workaround is expected to. CI (GitHub Actions' `ubuntu-latest`
runners) never hits this — it's Windows/MSVC-specific.

## Gaps worth knowing about, not fixing speculatively

- Every hook/mutation layer (`use*.ts` + its `*.api.ts`) across auth,
  payments, transactions, tenants, onboarding, and admin (including admin's
  API-key oversight) now has a test, plus both components that actually move
  money (`StkPushSection.tsx`, `B2cPayoutSection.tsx`). What's left is
  everything else *rendered* — tables, admin pages, other forms
  (login/register/reset-password UI, tenant-status controls, admin API-key
  table). That's a real, separate effort (component/UI testing), not a
  config tweak.
- `audit-logs.api.ts`'s `listAuditLogs` has no dedicated hook and no test —
  it's called directly from the admin audit-logs page component.
- No E2E/integration test against a real (or containerized) backend —
  everything today is unit-level with mocked `axios`/api modules. The full
  login → cookie → refresh → retry loop, and a real STK-push round trip,
  have never been exercised against an actual `Script-Pay-Backend`
  instance.
- Two small dead-code items surfaced while surveying every hook for this
  pass (see "What actually has tests today" above for detail):
  `src/modules/auth/refresh/refresh.api.ts` (`refresh()` has no importers)
  and `src/modules/payments/StkFormData.ts` (orphaned, out-of-sync type —
  the component uses `stkPush.schema.ts`'s inferred type instead). Neither
  is tested, on purpose — they're cleanup candidates, not test gaps.
