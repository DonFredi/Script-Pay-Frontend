import { serverEnv } from "./env/serverEnv";

export const serverConfig = {
  app: {
    env: serverEnv.NODE_ENV,
    sentryDsn: serverEnv.SENTRY_DSN,
  },
  keys: {
    sentryAuthToken: serverEnv.SENTRY_AUTH_TOKEN,
  },
};
