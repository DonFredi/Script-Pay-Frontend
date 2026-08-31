import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "./AuthProvider";
import type { User } from "@/modules/auth/shared/types";

// docs/testing.md previously called this out as untested: useAuth.spec.tsx
// deliberately only covers pass-through into AuthContext, mocking apiPrivate
// to fail immediately so AuthProvider settles into "unauthenticated" without
// exercising any of its actual rehydration/session logic. This file covers
// that logic directly: the mount-time silent-refresh rehydration (success, no
// session, and refresh-rejected paths) and setSession/clearSession.
jest.mock("@/shared/lib/api-client", () => ({
  __esModule: true,
  default: { get: jest.fn() },
  apiPrivate: { post: jest.fn() },
  setAccessToken: jest.fn(),
  getAccessToken: jest.fn(),
}));

import api from "@/shared/lib/api-client";
import { apiPrivate, setAccessToken } from "@/shared/lib/api-client";

const mockApiGet = api.get as jest.Mock;
const mockApiPrivatePost = apiPrivate.post as jest.Mock;
const mockSetAccessToken = setAccessToken as jest.Mock;

const mockUser: User = {
  id: "user-1",
  username: "merchant-one",
  email: "merchant@example.com",
  roles: ["TENANT_ADMIN"],
  tenantId: "tenant-1",
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rehydrates a session on mount when the refresh cookie yields a valid access token", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: "fresh-token" } } });
    mockApiGet.mockResolvedValue({ data: { success: true, payload: mockUser } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(mockApiPrivatePost).toHaveBeenCalledWith("/auth/refresh", {});
    expect(mockSetAccessToken).toHaveBeenCalledWith("fresh-token");
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it("settles into the unauthenticated state without fetching a profile when refresh returns no access token", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: null } } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(mockApiGet).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("clears the access token and settles unauthenticated when the refresh call itself rejects", async () => {
    mockApiPrivatePost.mockRejectedValue(new Error("no refresh cookie present"));

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("setSession sets the access token and user directly, independent of rehydration", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: null } } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    act(() => {
      result.current.setSession(mockUser, "login-token");
    });

    expect(mockSetAccessToken).toHaveBeenCalledWith("login-token");
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clearSession resets both the access token and the user", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: "fresh-token" } } });
    mockApiGet.mockResolvedValue({ data: { success: true, payload: mockUser } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    act(() => {
      result.current.clearSession();
    });

    expect(mockSetAccessToken).toHaveBeenLastCalledWith(null);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("logs out when api-client dispatches auth:session-expired (a refresh that definitively failed mid-session)", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: "fresh-token" } } });
    mockApiGet.mockResolvedValue({ data: { success: true, payload: mockUser } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    act(() => {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    });

    expect(mockSetAccessToken).toHaveBeenLastCalledWith(null);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("updateUser replaces the user without touching the access token", async () => {
    mockApiPrivatePost.mockResolvedValue({ data: { payload: { accessToken: "fresh-token" } } });
    mockApiGet.mockResolvedValue({ data: { success: true, payload: mockUser } });

    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    mockSetAccessToken.mockClear();
    const updated: User = { ...mockUser, tenantId: "tenant-2" };

    act(() => {
      result.current.updateUser(updated);
    });

    expect(result.current.user).toEqual(updated);
    expect(mockSetAccessToken).not.toHaveBeenCalled();
  });
});
