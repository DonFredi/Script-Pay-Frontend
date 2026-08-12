import * as Sentry from "@sentry/nextjs";
import { clientConfig } from "@/config/client";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { authBreadcrumbs } from "./sentry/sentry-breadcrumbs";

interface BackendErrorBody {
  success: false;
  message: string;
  statusCode: number;
  error?: { details?: unknown };
}

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

const api = axios.create({
  baseURL: clientConfig.api.apiUrl, // ← FIX: was empty string, now uses config
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiPrivate = axios.create({
  baseURL: clientConfig.api.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - ADD CSRF TOKEN TO POST/PUT/DELETE REQUESTS
const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Add Authorization header if we have access token
  if (config.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // ← ADD THIS SECTION: CSRF Protection
  // For state-changing methods (POST, PUT, DELETE, PATCH), add CSRF token
  const method = config.method?.toUpperCase();
  if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Read CSRF token from cookie (set by server during login/signup)
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return config;
};

// Helper to extract CSRF token from document cookies
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null; // Server-side rendering

  const cookieName = "csrf-token";
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

// Response interceptor
const responseInterceptor = (response: AxiosResponse): AxiosResponse => response;

const responseInterceptorError = async (error: AxiosError<BackendErrorBody>) => {
  /* SENTRY CODE STARTS */
  const status = error.response?.status;
  const url = error.config?.url;
  const method = error.config?.method;
  const shouldIgnore = status === 401 || status === 403;

  if (!shouldIgnore) {
    Sentry.captureException(error, {
      tags: {
        type: "api-error",
        endpoint: url,
        method,
      },
      extra: {
        status,
        data: error.response?.data,
      },
    });
  }
  /* SENTRY CODE ENDS */

  // ← ADD THIS SECTION: CSRF Token Errors
  // If we get a 403 and the error mentions CSRF, log it clearly
  if (status === 403 && error.response?.data?.message?.includes("CSRF")) {
    Sentry.captureMessage("CSRF token validation failed", "error");
    authBreadcrumbs("CSRF token validation failed", { error: error.response.data });
  }

  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // if no response, network error
  if (!error.response) {
    return Promise.reject(error);
  }

  // if not 401, reject
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }

  // prevent infinite loop
  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  // do not refresh on refresh endpoint itself
  if (originalRequest.url?.includes("/auth/refresh")) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  // if already refreshing, queue request
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(() => resolve(api(originalRequest)));
    });
  }

  isRefreshing = true;

  try {
    // call refresh endpoint
    authBreadcrumbs("Token refresh started");
    const res = await apiPrivate.post("/auth/refresh", {});
    const newAccessToken = res.data.payload?.accessToken ?? null;
    authBreadcrumbs("Token refresh successful");

    // save new token
    setAccessToken(newAccessToken);

    // retry all queued requests
    refreshQueue.forEach((cb) => cb());
    refreshQueue = [];

    // retry original request
    return api(originalRequest);
  } catch (refreshError) {
    // refresh failed logout scenario
    authBreadcrumbs("Token refresh failed", {
      error: String(refreshError),
    });
    setAccessToken(null);
    refreshQueue = [];
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
api.interceptors.response.use(responseInterceptor, responseInterceptorError);

// ← ADD THIS EXPORT: For testing/debugging
export { getCsrfTokenFromCookie };

export default api;
