import { renderHook } from "@testing-library/react";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth } from "./useAuth";

// AuthProvider calls apiPrivate.get("/profile") (via getCurrentUser) on mount to
// recover a session. Mocked here since this test only verifies that useAuth
// correctly passes through AuthContext's default/unauthenticated shape — actual
// login/session-recovery behavior belongs in AuthProvider's own test, not this one.
jest.mock("@/shared/lib/api-client", () => ({
  apiPrivate: { get: jest.fn().mockRejectedValue(new Error("no session")) },
  api: { get: jest.fn(), post: jest.fn() },
  setAccessToken: jest.fn(),
  getAccessToken: jest.fn(),
}));

describe("useAuth", () => {
  it("falls back to AuthContext's default (unauthenticated) shape outside AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isInitialized).toBe(false);

    spy.mockRestore();
  });

  it("passes through the real AuthProvider's context shape unmodified", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.setSession).toBe("function");
    expect(typeof result.current.clearSession).toBe("function");
    expect(typeof result.current.updateUser).toBe("function");
  });
});