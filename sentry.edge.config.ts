// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { clientConfig } from "@/config/client";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: clientConfig.app.sentryClientDsn,

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
  enabled: clientConfig.app.env === "production",
});
