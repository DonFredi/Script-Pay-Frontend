import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForgotPassword } from "./useForgotPassword";
import { forgotPassword } from "./forgot-password.api";

// forgot-password.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers useForgotPassword.ts's own toast wiring.
jest.mock("./forgot-password.api", () => ({ forgotPassword: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockForgotPassword = forgotPassword as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useForgotPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a success toast when the reset email is sent", async () => {
    mockForgotPassword.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    act(() => result.current.mutate({ email: "merchant@example.com" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith("Email sent successfully");
  });

  it("shows an error toast when the request fails", async () => {
    mockForgotPassword.mockRejectedValue(new Error("no account with that email"));
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    act(() => result.current.mutate({ email: "unknown@example.com" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("no account with that email");
  });
});
