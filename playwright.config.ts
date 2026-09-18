import { defineConfig } from "@playwright/test";

/**
 * Local-only for now (see docs/testing.md) — no webServer auto-start, no CI
 * wiring. This runs against whatever's already up on the machine: `npm run
 * dev` here, `npm run start:dev` in Script-Pay-Backend, and a real Postgres
 * the backend's DATABASE_URL points at. Nothing here can start the backend
 * or its database, so a test hitting a real endpoint (not mocked) will just
 * fail with a connection error if they aren't running — that's expected,
 * not a bug in the test.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
