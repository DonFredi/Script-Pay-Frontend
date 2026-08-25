import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useVerifyEmail } from "./useVerifyEmail";
import { verifyEmail } from "./verify-email.api";

// verify-email.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers useVerifyEmail.ts's own toast wiring.
jest.mock("./verify-email.api", () => ({ verifyEmail: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockVerifyEmail = verifyEmail as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useVerifyEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a success toast and forwards the token when verification succeeds", async () => {
    mockVerifyEmail.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useVerifyEmail(), { wrapper });

    act(() => result.current.mutate("verify-token"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockVerifyEmail).toHaveBeenCalledWith("verify-token");
    expect(toast.success).toHaveBeenCalledWith("Email verification successful");
  });

  it("shows an error toast when the token is invalid or expired", async () => {
    mockVerifyEmail.mockRejectedValue(new Error("token expired"));
    const { result } = renderHook(() => useVerifyEmail(), { wrapper });

    act(() => result.current.mutate("stale-token"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("token expired");
  });
});
