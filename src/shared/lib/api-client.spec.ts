/**
 * Covers the two behaviors docs/testing.md calls out as untested: the
 * request interceptor's Authorization/CSRF header attachment, and the
 * response interceptor's 401 -> /auth/refresh -> retry flow (single-flight
 * refresh with concurrent requests queued behind it, and the failure path).
 *
 * axios is mocked at the module boundary rather than hit over the network:
 * axios.create() returns a fake callable instance (axios instances are
 * callable, since a queued/retried request is replayed as `api(originalRequest)`)
 * whose interceptors.request.use / interceptors.response.use calls are
 * captured so the interceptor functions — otherwise private to this module —
 * can be invoked directly with crafted request/error objects.
 */

type FakeAxiosInstance = jest.Mock & {
  interceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };
  post: jest.Mock;
  get: jest.Mock;
};

const createFakeInstance = (): FakeAxiosInstance => {
  const instance = jest.fn() as unknown as FakeAxiosInstance;
  instance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  instance.post = jest.fn();
  instance.get = jest.fn();
  return instance;
};

jest.mock("axios", () => ({
  __esModule: true,
  default: { create: jest.fn(createFakeInstance) },
}));

jest.mock("@sentry/nextjs", () => ({
  __esModule: true,
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock("@/config/client", () => ({
  __esModule: true,
  clientConfig: { api: { apiUrl: "http://localhost:4000" } },
}));

import * as Sentry from "@sentry/nextjs";
import api, { apiPrivate, setAccessToken, getAccessToken, getCsrfTokenFromCookie } from "./api-client";

const fakeApi = api as unknown as FakeAxiosInstance;
const fakeApiPrivate = apiPrivate as unknown as FakeAxiosInstance;

const requestInterceptor = fakeApi.interceptors.request.use.mock.calls[0][0];
const responseInterceptorError = fakeApi.interceptors.response.use.mock.calls[0][1];

type RequestConfig = { url?: string; method?: string; _retry?: boolean };
type MinimalAxiosError = {
  response?: { status: number; data?: unknown };
  config?: RequestConfig;
};

const makeError = (overrides: MinimalAxiosError): MinimalAxiosError => overrides;

describe("api-client request interceptor", () => {
  beforeEach(() => {
    setAccessToken(null);
    document.cookie = "csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  });

  it("adds no Authorization header when there is no access token", () => {
    const config = { headers: {} as Record<string, string>, method: "get" };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("adds the Authorization header once an access token is set", () => {
    setAccessToken("token-123");
    expect(getAccessToken()).toBe("token-123");

    const config = { headers: {} as Record<string, string>, method: "get" };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe("Bearer token-123");
  });

  it("does not attach a CSRF header on GET even if the cookie is present", () => {
    document.cookie = "csrf-token=abc123";
    const config = { headers: {} as Record<string, string>, method: "get" };
    const result = requestInterceptor(config);
    expect(result.headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("attaches the CSRF header from the cookie on POST/PUT/PATCH/DELETE", () => {
    document.cookie = "csrf-token=abc123";
    for (const method of ["post", "put", "patch", "delete"]) {
      const config = { headers: {} as Record<string, string>, method };
      const result = requestInterceptor(config);
      expect(result.headers["X-CSRF-Token"]).toBe("abc123");
    }
  });

  it("omits the CSRF header on a state-changing request when no cookie is set", () => {
    const config = { headers: {} as Record<string, string>, method: "post" };
    const result = requestInterceptor(config);
    expect(result.headers["X-CSRF-Token"]).toBeUndefined();
  });
});

describe("getCsrfTokenFromCookie", () => {
  afterEach(() => {
    document.cookie = "csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  });

  it("returns null when the cookie is absent", () => {
    expect(getCsrfTokenFromCookie()).toBeNull();
  });

  it("finds the token among other cookies and decodes it", () => {
    document.cookie = "other=1";
    document.cookie = `csrf-token=${encodeURIComponent("a b/c")}`;
    expect(getCsrfTokenFromCookie()).toBe("a b/c");
  });
});

describe("api-client response interceptor — 401 refresh/retry", () => {
  beforeEach(() => {
    setAccessToken(null);
    fakeApi.mockReset();
    fakeApiPrivate.post.mockReset();
    (Sentry.captureException as jest.Mock).mockClear();
    (Sentry.captureMessage as jest.Mock).mockClear();
  });

  it("passes through a non-401 error untouched", async () => {
    const error = makeError({ response: { status: 500 }, config: { url: "/payments/stk-push", method: "post" } });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(fakeApiPrivate.post).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("rejects a network error (no response) without touching refresh", async () => {
    const error = makeError({ config: { url: "/transactions", method: "get" } });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(fakeApiPrivate.post).not.toHaveBeenCalled();
  });

  it("does not report 401/403 to Sentry as an api-error", async () => {
    const error = makeError({ response: { status: 401 }, config: { url: "/transactions", method: "get", _retry: true } });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("captures a CSRF-flagged 403 as a Sentry message and still rejects", async () => {
    const error = makeError({
      response: { status: 403, data: { message: "CSRF token invalid" } },
      config: { url: "/payments/stk-push", method: "post" },
    });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(Sentry.captureMessage).toHaveBeenCalledWith("CSRF token validation failed", "error");
  });

  it("scrubs a validation error down to field names only, never the submitted values", async () => {
    const error = makeError({
      response: {
        status: 422,
        data: {
          success: false,
          message: "Validation failed",
          statusCode: 422,
          error: { details: { fieldErrors: { msisdn: ["Invalid phone number"], amountMinorUnits: ["Required"] } } },
        },
      },
      config: { url: "/payments/stk-push", method: "post" },
    });

    await expect(responseInterceptorError(error)).rejects.toBe(error);

    expect(Sentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        extra: expect.objectContaining({
          data: expect.objectContaining({
            message: "Validation failed",
            statusCode: 422,
            invalidFields: ["msisdn", "amountMinorUnits"],
          }),
        }),
      }),
    );
  });

  it("refreshes once on a first 401, then retries the original request", async () => {
    fakeApiPrivate.post.mockResolvedValue({ data: { payload: { accessToken: "new-token" } } });
    fakeApi.mockResolvedValue({ data: "retried-ok" });

    const originalRequest: RequestConfig = { url: "/transactions", method: "get" };
    const error = makeError({ response: { status: 401 }, config: originalRequest });

    const result = await responseInterceptorError(error);

    expect(fakeApiPrivate.post).toHaveBeenCalledWith("/auth/refresh", {});
    expect(getAccessToken()).toBe("new-token");
    expect(fakeApi).toHaveBeenCalledWith(originalRequest);
    expect(originalRequest._retry).toBe(true);
    expect(result).toEqual({ data: "retried-ok" });
  });

  it("does not attempt refresh for a 401 on the refresh endpoint itself", async () => {
    const error = makeError({ response: { status: 401 }, config: { url: "/auth/refresh", method: "post" } });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(fakeApiPrivate.post).not.toHaveBeenCalled();
  });

  it("does not retry a request that has already been retried once", async () => {
    const error = makeError({ response: { status: 401 }, config: { url: "/transactions", method: "get", _retry: true } });
    await expect(responseInterceptorError(error)).rejects.toBe(error);
    expect(fakeApiPrivate.post).not.toHaveBeenCalled();
  });

  it("queues a concurrent 401 behind the in-flight refresh instead of starting a second one", async () => {
    let resolveRefresh!: (value: unknown) => void;
    fakeApiPrivate.post.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    fakeApi.mockResolvedValue({ data: "ok" });

    const firstRequest: RequestConfig = { url: "/transactions", method: "get" };
    const secondRequest: RequestConfig = { url: "/payments/stk-push", method: "post" };

    const firstCall = responseInterceptorError(makeError({ response: { status: 401 }, config: firstRequest }));
    const secondCall = responseInterceptorError(makeError({ response: { status: 401 }, config: secondRequest }));

    // Only the first 401 should have triggered an actual refresh call.
    expect(fakeApiPrivate.post).toHaveBeenCalledTimes(1);

    resolveRefresh({ data: { payload: { accessToken: "new-token" } } });
    await Promise.all([firstCall, secondCall]);

    expect(fakeApi).toHaveBeenCalledWith(firstRequest);
    expect(fakeApi).toHaveBeenCalledWith(secondRequest);
    expect(fakeApi).toHaveBeenCalledTimes(2);
  });

  it("rejects a concurrent 401 queued behind an in-flight refresh that ultimately fails", async () => {
    let rejectRefresh!: (error: unknown) => void;
    const refreshError = new Error("refresh failed");
    fakeApiPrivate.post.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectRefresh = reject;
      }),
    );

    const firstRequest: RequestConfig = { url: "/transactions", method: "get" };
    const secondRequest: RequestConfig = { url: "/payments/stk-push", method: "post" };

    const firstCall = responseInterceptorError(makeError({ response: { status: 401 }, config: firstRequest }));
    const secondCall = responseInterceptorError(makeError({ response: { status: 401 }, config: secondRequest }));

    expect(fakeApiPrivate.post).toHaveBeenCalledTimes(1);

    rejectRefresh(refreshError);

    await expect(firstCall).rejects.toBe(refreshError);
    await expect(secondCall).rejects.toBe(refreshError);
    expect(fakeApi).not.toHaveBeenCalled();
  });

  it("clears the access token and rejects queued requests when refresh itself fails", async () => {
    setAccessToken("stale-token");
    const refreshError = new Error("refresh failed");
    fakeApiPrivate.post.mockRejectedValue(refreshError);

    const originalRequest: RequestConfig = { url: "/transactions", method: "get" };
    const error = makeError({ response: { status: 401 }, config: originalRequest });

    await expect(responseInterceptorError(error)).rejects.toBe(refreshError);
    expect(getAccessToken()).toBeNull();
    expect(fakeApi).not.toHaveBeenCalled();
  });

  it("allows a fresh refresh attempt after a previous refresh failure (isRefreshing is released)", async () => {
    fakeApiPrivate.post.mockRejectedValueOnce(new Error("first refresh failed"));
    const firstRequest: RequestConfig = { url: "/transactions", method: "get" };
    await expect(
      responseInterceptorError(makeError({ response: { status: 401 }, config: firstRequest })),
    ).rejects.toThrow("first refresh failed");

    fakeApiPrivate.post.mockResolvedValueOnce({ data: { payload: { accessToken: "second-token" } } });
    fakeApi.mockResolvedValue({ data: "ok" });
    const secondRequest: RequestConfig = { url: "/payments/stk-push", method: "post" };
    await responseInterceptorError(makeError({ response: { status: 401 }, config: secondRequest }));

    expect(fakeApiPrivate.post).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBe("second-token");
  });
});

describe("apiPrivate interceptors", () => {
  const privateRequestUse = fakeApiPrivate.interceptors.request.use.mock.calls[0];

  it("attaches the same request interceptor api uses, so /auth/refresh still gets its headers", () => {
    expect(privateRequestUse[0]).toBe(requestInterceptor);
  });

  it("registers no response interceptor, so a failed refresh cannot recurse into the 401 retry flow", () => {
    expect(fakeApiPrivate.interceptors.response.use).not.toHaveBeenCalled();
  });

  it("rejects a request-interceptor error instead of swallowing it", async () => {
    const error = new Error("request setup failed");
    await expect(privateRequestUse[1](error)).rejects.toBe(error);
  });
});
