import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  SENTRY_DSN: z.url(),
  SENTRY_AUTH_TOKEN: z.string().min(1),
  // Used for the contact-us form email, not auth — signup/login/password-reset
  // emails are the backend's responsibility now (see scriptpay-backend's
  // EmailService), not this frontend's.
  RESEND_API_KEY: z.string().min(1),
  EMAIL_API_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.log("Invalid Server Env variables", parsedEnv.error);
  process.exit(1);
}

export const serverEnv = parsedEnv.data;
