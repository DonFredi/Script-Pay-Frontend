import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOnboardTenant } from "./useOnboardTenant";
import { onboardTenant } from "./onboarding.api";
import { getCurrentUser } from "@/modules/auth/me/me.api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { User } from "@/modules/auth/shared/types";
import { siteConfig } from "@/config/site";

// onboarding.api.ts's own request/response handling (including its own
// refresh-token side effect) is covered by api-client.spec.ts. This covers
// what useOnboardTenant.ts itself is responsible for, per its own comment:
// re-fetching the profile after onboarding so the in-memory user gets the
// new tenantId, via updateUser (never setSession — must not touch the token
// onboardTenant.api.ts already refreshed).
jest.mock("./onboarding.api", () => ({ onboardTenant: jest.fn() }));
jest.mock("@/modules/auth/me/me.api", () => ({ getCurrentUser: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuthContext: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockOnboardTenant = onboardTenant as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;

const mockUser: User = {
  id: "user-1",
  username: "merchant-one",
  email: "merchant@example.com",
  roles: ["TENANT_ADMIN"],
  tenantId: "tenant-1",
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useOnboardTenant", () => {
  const updateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ updateUser });
  });

  it("refetches the profile and updates the user (not the token) on success", async () => {
    mockOnboardTenant.mockResolvedValue({ id: "tenant-1", name: "Acme", businessShortcode: "123456", status: "active" });
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useOnboardTenant(), { wrapper });

    act(() => result.current.mutate({ name: "Acme", businessShortcode: "123456" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith(mockUser);
    expect(toast.success).toHaveBeenCalledWith(`Tenant created — welcome to ${siteConfig.name}`);
  });

  it("does not refetch the profile or update the user when onboarding fails", async () => {
    mockOnboardTenant.mockRejectedValue(new Error("shortcode already in use"));

    const { result } = renderHook(() => useOnboardTenant(), { wrapper });

    act(() => result.current.mutate({ name: "Acme", businessShortcode: "123456" }));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("shortcode already in use");
  });
});
