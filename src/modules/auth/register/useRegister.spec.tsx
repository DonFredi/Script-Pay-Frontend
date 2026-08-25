import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRegister } from "./useRegister";
import { register } from "./register.api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { User } from "../shared/types";

// register.api.ts's own request/response handling is covered by
// api-client.spec.ts. This file covers what useRegister.ts itself is
// responsible for: establishing a session immediately post-signup (per its
// own comment — RegisterForm still redirects to /auth/verify-email, this
// doesn't skip that) and surfacing the right toast on each outcome.
jest.mock("./register.api", () => ({ register: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuthContext: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@sentry/nextjs", () => ({ __esModule: true, addBreadcrumb: jest.fn() }));

const mockRegister = register as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;

const mockUser: User = {
  id: "user-2",
  username: "new-merchant",
  email: "new-merchant@example.com",
  roles: ["TENANT_ADMIN"],
  tenantId: "tenant-2",
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useRegister", () => {
  const setSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ setSession });
  });

  it("establishes a session and shows a success toast on successful registration", async () => {
    mockRegister.mockResolvedValue({ user: mockUser, accessToken: "register-token" });

    const { result } = renderHook(() => useRegister(), { wrapper });

    act(() => {
      result.current.mutate({
        email: mockUser.email,
        password: "secret123",
        username: mockUser.username,
      } as never);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSession).toHaveBeenCalledWith(mockUser, "register-token");
    expect(toast.success).toHaveBeenCalledWith("Account created successfully");
  });

  it("does not establish a session and shows an error toast when registration fails", async () => {
    mockRegister.mockRejectedValue(new Error("email already in use"));

    const { result } = renderHook(() => useRegister(), { wrapper });

    act(() => {
      result.current.mutate({
        email: mockUser.email,
        password: "secret123",
        username: mockUser.username,
      } as never);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setSession).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
