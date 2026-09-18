# E2E tests

Local-only for now — not wired into CI (`.github/workflows/ci.yml`). These
run against real servers, not mocked axios, unlike everything under `src/`
(see `docs/testing.md`'s "Known gaps").

## Prerequisites

1. `Script-Pay-Backend` running against a real Postgres (`npm run start:dev`
   there, with `DATABASE_URL` set).
2. This app running (`npm run dev`), with `.env.local` pointing
   `NEXT_PUBLIC_API_URL` at that backend.
3. Browsers installed once: `npx playwright install chromium` (this sandbox
   couldn't reach `cdn.playwright.dev` to do this step — run it yourself).

## Running

```bash
npm run test:e2e
```

Each run signs up a fresh throwaway user (`e2e-<timestamp>@example.com`) —
no seeded fixture data or backend-side cleanup required, but the backend's
`users` table will accumulate one row per run.

## What's covered vs. what isn't

`auth-refresh.spec.ts` covers the real signup → cookie → silent-refresh →
authenticated-request chain. It does not yet cover the interceptor's
mid-session 401-triggers-refresh-then-retries-original-request path (that
needs the in-memory access token to go stale while the refresh cookie is
still valid — either waiting out the real ~15 min token TTL, or intercepting
one API response with Playwright's `page.route` to synthesize a 401). Add
that as a second test if/when it's worth the added complexity.
