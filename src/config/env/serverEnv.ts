import z from "zod";

/**
 * Sentry vars are optional — a missing DSN just means Sentry.init() no-ops
 * (no error reporting), not a broken app. RESEND_API_KEY/EMAIL_API_KEY used
 * to be required here too, for the contact-form feature removed 2026-08-21
 * (see CLAUDE.md) — keeping them required after that feature was deleted
 * meant a Vercel deployment without those (now-pointless) env vars set would
 * fail this validation on every route that touches this module.
 *
 * IMPORTANT: never process.exit() (or throw) from this module. It used to
 * call process.exit(1) on a failed parse — this module loads via
 * sentry.server.config.ts during serverless function instrumentation
 * (instrumentation.ts's register(), which Next.js runs on every cold start
 * of a Node.js function), so exiting the process took down the ENTIRE
 * function — every request it handled, on every dynamic route — instead of
 * just degrading the one thing (Sentry reporting) an actually-missing var
 * would affect. This was the real cause of dynamic routes (transactions/[id],
 * admin/tenants/[tenantId], etc.) 500ing in production while static routes
 * were unaffected: static pages never invoke a live function at request
 * time, so they never hit this code path at all.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  SENTRY_DSN: z.url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid server environment variables:", parsedEnv.error.flatten().fieldErrors);
}

export const serverEnv = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
