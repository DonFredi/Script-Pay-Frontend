import { serverEnv } from "./env/serverEnv";

export const serverConfig = {
  app: {
    env: serverEnv.NODE_ENV,
    // callbackUrl: serverEnv.MPESA_CALLBACK_URL,
    // baseUrl: serverEnv.BASE_URL,
    sentryDsn: serverEnv.SENTRY_DSN,
  },
  keys: {
    resendApiKey: serverEnv.RESEND_API_KEY,
    emailApiKey: serverEnv.EMAIL_API_KEY,
    sentryAuthToken: serverEnv.SENTRY_AUTH_TOKEN,
  },
};
