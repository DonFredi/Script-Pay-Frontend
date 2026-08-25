import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLogout } from "./useLogout";
import { logout } from "./logout.api";
import { useAuthContext } from "@/providers/AuthProvider";
import { queryClient as sharedQueryClient } from "@/shared/lib/query-client";

// logout.api.ts's own request/response handling is covered by
// api-client.spec.ts. This file covers what useLogout.ts itself is
// responsible for: clearing the session and the shared query cache on both
// success AND failure — per its own comment, the person clicked "log out"
// and expects to end up logged out locally even if the server call failed.
jest.mock("./logout.api", () => ({ logout: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuthContext: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@sentry/nextjs", () => ({ __esModule: true, addBreadcrumb: jest.fn() }));
jest.mock("@/shared/lib/query-client", () => ({ queryClient: { clear: jest.fn() } }));

const mockLogout = logout as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockQueryClientClear = sharedQueryClient.clear as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useLogout", () => {
  const clearSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ clearSession });
  });

  it("clears the session and query cache on successful logout", async () => {
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(mockQueryClientClear).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Logout successful");
  });

  it("still clears the session and query cache when the server call fails", async () => {
    mockLogout.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(mockQueryClientClear).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalled();
  });
});
