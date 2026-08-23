/**
 * @jest-environment node
 */
// Edge middleware uses Web Fetch primitives (Request/Response/Headers) from
// next/server, which are Node-native globals, not jsdom's — running this file
// under the project's default jsdom testEnvironment produces subtle
// instanceof/constructor mismatches, so it's overridden to "node" here.

import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { middleware } from "./middleware";

const SECRET = "test-jwt-access-secret";

const signToken = (payload: Record<string, unknown>, expiresIn = "15m") =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresIn).sign(new TextEncoder().encode(SECRET));

const makeRequest = (path: string, cookies: Record<string, string> = {}) => {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
};

const isPassThrough = (res: Response) => res.headers.get("x-middleware-next") === "1";
const redirectLocation = (res: Response) => (res.status >= 300 && res.status < 400 ? res.headers.get("location") : null);

describe("middleware", () => {
  const originalSecret = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.JWT_ACCESS_SECRET = originalSecret;
  });

  it("lets an unprotected route through with no cookies at all", async () => {
    const res = await middleware(makeRequest("/"));
    expect(isPassThrough(res)).toBe(true);
  });

  it("redirects a protected non-admin route to login when no cookies are present", async () => {
    const res = await middleware(makeRequest("/dashboard"));
    const location = redirectLocation(res);
    expect(location).not.toBeNull();
    const url = new URL(location!);
    expect(url.pathname).toBe("/auth/login");
    expect(url.searchParams.get("redirect")).toBe("/dashboard");
  });

  it("lets a protected non-admin route through with a valid access token", async () => {
    const token = await signToken({ role: "MERCHANT" });
    const res = await middleware(makeRequest("/payments", { access_token: token }));
    expect(isPassThrough(res)).toBe(true);
  });

  it("lets a protected non-admin route through when the access token is invalid but a refresh token exists", async () => {
    const res = await middleware(
      makeRequest("/transactions", { access_token: "not-a-real-jwt", refresh_token: "some-refresh-token" }),
    );
    expect(isPassThrough(res)).toBe(true);
  });

  it("lets a protected non-admin route through with only an expired access token plus a refresh token", async () => {
    const expired = await signToken({ role: "MERCHANT" }, "-1s");
    const res = await middleware(makeRequest("/api-keys", { access_token: expired, refresh_token: "refresh-abc" }));
    expect(isPassThrough(res)).toBe(true);
  });

  it("redirects an admin route to login when no cookies are present", async () => {
    const res = await middleware(makeRequest("/admin/tenants"));
    const location = redirectLocation(res);
    expect(location).not.toBeNull();
    const url = new URL(location!);
    expect(url.pathname).toBe("/auth/login");
    expect(url.searchParams.get("redirect")).toBe("/admin/tenants");
  });

  it("redirects an admin route to login when the access token can't be verified, even with a refresh token", async () => {
    const res = await middleware(makeRequest("/admin/dashboard", { access_token: "garbage", refresh_token: "refresh-abc" }));
    const location = redirectLocation(res);
    expect(location).not.toBeNull();
    expect(new URL(location!).pathname).toBe("/auth/login");
  });

  it("lets an admin route through for a verified SUPER_ADMIN role", async () => {
    const token = await signToken({ role: "SUPER_ADMIN" });
    const res = await middleware(makeRequest("/admin/dashboard", { access_token: token }));
    expect(isPassThrough(res)).toBe(true);
  });

  it("redirects a non-admin role to /unauthorized on an admin route, even with a verified token", async () => {
    const token = await signToken({ role: "MERCHANT" });
    const res = await middleware(makeRequest("/admin/dashboard", { access_token: token }));
    const location = redirectLocation(res);
    expect(location).not.toBeNull();
    expect(new URL(location!).pathname).toBe("/unauthorized");
  });

  it("only enforces the role check on /admin, not on other protected prefixes", async () => {
    const token = await signToken({ role: "MERCHANT" });
    const res = await middleware(makeRequest("/settings", { access_token: token }));
    expect(isPassThrough(res)).toBe(true);
  });
});
