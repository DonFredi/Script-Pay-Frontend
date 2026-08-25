import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLogin } from "./useLogin";
import { login } from "./login.api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { User } from "../shared/types";

// login.api.ts's own request/response handling is covered by api-client.spec.ts.
// This file covers what useLogin.ts itself is responsible for: calling
// setSession on success (previously a real bug here — see useLogin.ts's own
// comment: this call was commented out and isAuthenticated never became true
// after a "successful" login) and surfacing the right toast on each outcome.
jest.mock("./login.api", () => ({ login: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuthContext: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@sentry/nextjs", () => ({ __esModule: true, addBreadcrumb: jest.fn() }));

const mockLogin = login as jest.Mock;
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

describe("useLogin", () => {
  const setSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ setSession });
  });

  it("establishes a session and shows a success toast on a successful login", async () => {
    mockLogin.mockResolvedValue({ user: mockUser, accessToken: "login-token" });

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({ email: mockUser.email, password: "secret" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSession).toHaveBeenCalledWith(mockUser, "login-token");
    expect(toast.success).toHaveBeenCalledWith("Login successful");
  });

  it("does not establish a session and shows an error toast when login fails", async () => {
    mockLogin.mockRejectedValue(new Error("invalid credentials"));

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({ email: mockUser.email, password: "wrong" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setSession).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
