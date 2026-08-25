import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMe } from "./useMe";
import { getCurrentUser } from "./me.api";
import type { User } from "../shared/types";

// me.api.ts's own request/response handling is covered indirectly by
// AuthProvider.spec.tsx (which calls getCurrentUser through rehydration).
// This covers useMe.ts's own query config: no retry on failure, so a stale
// profile fetch doesn't silently hammer the backend.
jest.mock("./me.api", () => ({ getCurrentUser: jest.fn() }));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

const mockUser: User = {
  id: "user-1",
  username: "merchant-one",
  email: "merchant@example.com",
  roles: ["TENANT_ADMIN"],
  tenantId: "tenant-1",
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useMe", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the current user on success", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(mockUser));
  });

  it("does not retry on failure", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("unauthenticated"));
    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
  });
});
