module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Coverage is collected only for files actually imported by a test (jest's
  // default — no collectCoverageFrom set). Most of src/ (components, other
  // feature modules) has no tests yet, see docs/testing.md, so the "All files"
  // summary reflects only the auth-critical path that's deliberately tested
  // today, not the whole codebase. A repo-wide collectCoverageFrom was
  // considered and rejected: instrumenting every file under src/ means
  // requiring files never otherwise loaded in a test context purely to
  // measure them — e.g. clientEnv.ts throws on invalid/missing env at module
  // load, and Server Components importing "server-only" throw outside a
  // server context — which risks breaking coverage collection itself rather
  // than just reporting a low number.
  //
  // Thresholds below are scoped to the files docs/testing.md documents as
  // deliberately tested, set a little under their current actual coverage so
  // a real regression fails CI without pretending the rest of the codebase
  // is covered.
  coverageThreshold: {
    "./src/middleware.ts": { statements: 100, branches: 90, functions: 100, lines: 100 },
    "./src/shared/lib/api-client.ts": { statements: 90, branches: 75, functions: 80, lines: 95 },
    "./src/providers/AuthProvider.tsx": { statements: 95, branches: 65, functions: 65, lines: 95 },
    "./src/modules/auth/shared/hooks/useAuth.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/auth/login/useLogin.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/auth/register/useRegister.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/auth/logout/useLogout.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/payments/usePollTransactionStatus.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/payments/sections/StkPushSection.tsx": { statements: 90, branches: 75, functions: 70, lines: 90 },
    "./src/modules/transactions/useTransactions.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/auth/forgot-password/useForgotPassword.ts": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "./src/modules/auth/resend-verification/useResendVerification.ts": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "./src/modules/auth/reset-password/useResetPassword.ts": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "./src/modules/auth/verify-email/useVerifyEmail.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/auth/me/useMe.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/onboarding/useOnboardTenant.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/api-keys/useApiKeys.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/tenants/useMpesaCredentials.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/admin/useTenants.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/modules/admin/useTenantApiKeys.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
};
