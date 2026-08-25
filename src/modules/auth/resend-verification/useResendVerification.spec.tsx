import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useResendVerification } from "./useResendVerification";
import { resendVerification } from "./resend-verification.api";

// resend-verification.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers useResendVerification.ts's own toast wiring.
jest.mock("./resend-verification.api", () => ({ resendVerification: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockResendVerification = resendVerification as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useResendVerification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a success toast and forwards the email when the resend succeeds", async () => {
    mockResendVerification.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useResendVerification(), { wrapper });

    act(() => result.current.mutate("merchant@example.com"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockResendVerification).toHaveBeenCalledWith("merchant@example.com");
    expect(toast.success).toHaveBeenCalledWith("Email verification sent successful");
  });

  it("shows an error toast when the resend fails", async () => {
    mockResendVerification.mockRejectedValue(new Error("already verified"));
    const { result } = renderHook(() => useResendVerification(), { wrapper });

    act(() => result.current.mutate("merchant@example.com"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("already verified");
  });
});
