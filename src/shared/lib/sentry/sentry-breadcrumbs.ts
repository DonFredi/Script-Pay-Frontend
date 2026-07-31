import * as Sentry from "@sentry/nextjs";

export const authBreadcrumbs = (message: string, data?: Record<string, unknown>) => {
  Sentry.addBreadcrumb({
    category: "auth",
    message,
    level: "info",
    data,
  });
};
