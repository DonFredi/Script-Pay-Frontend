import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useResetPassword } from "./useResetPassword";
import { resetPassword } from "./reset-password.api";

// reset-password.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers useResetPassword.ts's own toast wiring.
jest.mock("./reset-password.api", () => ({ resetPassword: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockResetPassword = resetPassword as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useResetPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a success toast when the password is reset", async () => {
    mockResetPassword.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    act(() =>
      result.current.mutate({ token: "reset-token", password: "new-secret", confirmPassword: "new-secret" }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith("Password updated — please log in with your new password");
  });

  it("shows an error toast when the reset token is invalid or expired", async () => {
    mockResetPassword.mockRejectedValue(new Error("token expired"));
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    act(() =>
      result.current.mutate({ token: "stale-token", password: "new-secret", confirmPassword: "new-secret" }),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("token expired");
  });
});
