import z from "zod";

// Firebase is gone entirely now — auth is handled directly by the backend
// (email/password, argon2, its own JWTs), so no NEXT_PUBLIC_FIREBASE_* vars are
// needed anymore. This used to require all six as mandatory, meaning the app
// would refuse to boot without Firebase credentials that nothing reads anymore.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SENTRY_DSN: z.url(),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

if (!parsedEnv.success) {
  console.error("Invalid client environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid client environment variables — check .env.local against .env.example");
}

export const clientEnv = parsedEnv.data;
