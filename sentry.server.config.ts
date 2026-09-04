// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { serverConfig } from "@/config/server";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: serverConfig.app.sentryDsn,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Deliberately OFF. This is the Sentry wizard's scaffold default, and on a Kenyan
  // M-Pesa platform it is the wrong one: sendDefaultPii attaches request headers,
  // bodies and IP addresses to every event — which on this app means the httpOnly
  // access_token/refresh_token cookies and payment request bodies carrying msisdn
  // and amount. api-client.ts already refuses to send those (see
  // scrubErrorDataForSentry, which whitelists field NAMES only); leaving this true
  // handed Sentry the same data through the back door. The backend's Sentry.init
  // in main.ts has always been off for exactly this reason.
  sendDefaultPii: false,
  enabled: serverConfig.app.env === "production",
});
