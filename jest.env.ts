// Dummy client env vars for the test run, set before any module is loaded.
//
// src/config/env/clientEnv.ts validates NEXT_PUBLIC_API_URL / _SITE_URL /
// _SENTRY_DSN with zod and throws at module load if any is missing, so any test
// whose import graph reaches src/config/site.ts (e.g. StkPushSection.tsx,
// useOnboardTenant.ts) fails to even start without them. Jest doesn't load
// .env.local, so without this the suite only passes on a machine that happens to
// have one — CI's `test` job has no env at all and failed on exactly this
// (run 33178627602, 2026-08-28). The `build` job in .github/workflows/ci.yml sets
// the same three dummies for the same reason.
//
// This lives in `setupFiles` rather than `jest.setup.ts` (`setupFilesAfterEnv`)
// deliberately: it must be plain assignments running before any import, and TS
// hoists `import` above statements within a single file. `??=` so a real value
// exported in the shell still wins.
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:4000";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_SENTRY_DSN ??= "https://public@sentry.example/0";
