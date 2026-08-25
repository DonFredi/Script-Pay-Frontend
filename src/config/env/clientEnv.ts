import z from "zod";

// Firebase is gone entirely now — auth is handled directly by the backend
// (email/password, argon2, its own JWTs), so no NEXT_PUBLIC_FIREBASE_* vars are
// needed anymore. This used to require all six as mandatory, meaning the app
// would refuse to boot without Firebase credentials that nothing reads anymore.

// .env.example lists the branding vars below with empty values (documentation,
// not real values) — Next.js loads an empty-but-present var as "", not
// undefined, so a plain `.default(...)` wouldn't apply and min(1) would throw.
// This coerces "" to undefined first so the ScriptPay default actually kicks in
// for anyone who copies .env.example into .env.local without filling them in.
const optionalWithDefault = (fallback: string) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).default(fallback));

// Branding vars all default to ScriptPay's own values, so an unset .env behaves
// exactly as before — they only need to change for a differently-branded
// deployment of this same codebase (see docs/decisions.md, entry 8).
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SENTRY_DSN: z.url(),

  NEXT_PUBLIC_SITE_NAME: optionalWithDefault("Script Pay"),
  NEXT_PUBLIC_SITE_DESCRIPTION: optionalWithDefault("Online M-Pesa payments for businesses"),
  NEXT_PUBLIC_CONTACT_PHONE: optionalWithDefault("+254 797 162 262"),
  NEXT_PUBLIC_CONTACT_EMAIL: optionalWithDefault("scripttagg@gmail.com"),
  NEXT_PUBLIC_CONTACT_WHATSAPP: optionalWithDefault("+254 797 162 262"),
  NEXT_PUBLIC_ADDRESS: optionalWithDefault("Obama Estate"),
  NEXT_PUBLIC_OG_IMAGE: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("")),
  NEXT_PUBLIC_SOCIAL_TWITTER: optionalWithDefault("https://x.com/scripttagg"),
  NEXT_PUBLIC_SOCIAL_INSTAGRAM: optionalWithDefault("https://instagram.com/scripttagg"),
  NEXT_PUBLIC_SOCIAL_PINTEREST: optionalWithDefault("https://pinterest.com/scripttagg"),
  NEXT_PUBLIC_SOCIAL_TIKTOK: optionalWithDefault("https://www.tiktok.com/@scripttagg"),
  NEXT_PUBLIC_SOCIAL_GITHUB: optionalWithDefault("https://www.github.com/scripttagg"),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_CONTACT_WHATSAPP: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP,
  NEXT_PUBLIC_ADDRESS: process.env.NEXT_PUBLIC_ADDRESS,
  NEXT_PUBLIC_OG_IMAGE: process.env.NEXT_PUBLIC_OG_IMAGE,
  NEXT_PUBLIC_SOCIAL_TWITTER: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
  NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  NEXT_PUBLIC_SOCIAL_PINTEREST: process.env.NEXT_PUBLIC_SOCIAL_PINTEREST,
  NEXT_PUBLIC_SOCIAL_TIKTOK: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
  NEXT_PUBLIC_SOCIAL_GITHUB: process.env.NEXT_PUBLIC_SOCIAL_GITHUB,
});

if (!parsedEnv.success) {
  console.error("Invalid client environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid client environment variables — check .env.local against .env.example");
}

export const clientEnv = parsedEnv.data;
