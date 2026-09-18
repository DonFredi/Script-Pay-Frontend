import { test, expect } from "@playwright/test";

/**
 * Exercises the one chain docs/security.md and docs/decisions.md both flag
 * as untested today: real signup → httpOnly cookies → a fresh page load that
 * wipes the in-memory access token → AuthProvider's silent
 * POST /auth/refresh → a subsequent authenticated GET /profile succeeding —
 * all against a real Script-Pay-Backend instance, not mocked axios.
 *
 * `page.goto` (not a client-side Link click) is what makes this test mean
 * anything: it forces a full browser navigation, which is the only way to
 * actually clear api-client.ts's module-level `accessToken` variable and
 * prove the session survives on nothing but the refresh_token cookie.
 */
test("signup establishes a session that survives a full page reload via silent refresh", async ({ page }) => {
  const unique = Date.now();
  const email = `e2e-${unique}@example.com`;
  const password = "correct horse battery staple";

  await page.goto("/auth/register");
  await page.getByLabel("Username").fill(`e2e-user-${unique}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();

  // RegisterForm redirects here regardless of verification status (see
  // useRegister.ts) — signup already established a real session before this
  // navigation happens.
  await expect(page).toHaveURL(/\/auth\/verify-email/);

  // Full navigation: wipes the in-memory access token set by useRegister's
  // setSession, leaving only the httpOnly refresh_token cookie to recover
  // the session from — exactly the gap the docs describe as untested.
  const refreshResponse = page.waitForResponse(
    (res) => res.url().includes("/api/backend/auth/refresh") && res.request().method() === "POST",
  );
  const profileResponse = page.waitForResponse(
    (res) => res.url().includes("/api/backend/profile") && res.request().method() === "GET",
  );

  await page.goto("/dashboard");

  const refresh = await refreshResponse;
  expect(refresh.status()).toBe(200);
  const refreshBody = await refresh.json();
  expect(refreshBody.payload?.accessToken ?? refreshBody.accessToken).toBeTruthy();

  const profile = await profileResponse;
  expect(profile.status()).toBe(200);

  // No bounce back to login — proxy.ts and AuthProvider both accepted the
  // recovered session.
  await expect(page).toHaveURL(/\/dashboard/);
});
