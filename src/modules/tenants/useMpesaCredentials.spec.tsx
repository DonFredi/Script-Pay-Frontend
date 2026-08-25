import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSetMpesaCredentials } from "./useMpesaCredentials";
import { setMpesaCredentials } from "./mpesa-credentials.api";

// mpesa-credentials.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers useSetMpesaCredentials.ts's own tenantId
// binding and toast wiring — a payment-config-critical path (wrong
// credentials silently configured means every subsequent STK push fails).
jest.mock("./mpesa-credentials.api", () => ({ setMpesaCredentials: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockSetMpesaCredentials = setMpesaCredentials as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useSetMpesaCredentials", () => {
  beforeEach(() => jest.clearAllMocks());

  it("binds the tenantId argument into the api call and shows a success toast", async () => {
    mockSetMpesaCredentials.mockResolvedValue({ configured: true });
    const { result } = renderHook(() => useSetMpesaCredentials("tenant-1"), { wrapper });

    act(() =>
      result.current.mutate({
        businessShortcode: "123456",
        consumerKey: "ck",
        consumerSecret: "cs",
        passkey: "pk",
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSetMpesaCredentials).toHaveBeenCalledWith(
      "tenant-1",
      expect.objectContaining({ businessShortcode: "123456" }),
    );
    expect(toast.success).toHaveBeenCalledWith("M-Pesa credentials saved");
  });

  it("shows an error toast when saving fails", async () => {
    mockSetMpesaCredentials.mockRejectedValue(new Error("invalid consumer secret"));
    const { result } = renderHook(() => useSetMpesaCredentials("tenant-1"), { wrapper });

    act(() =>
      result.current.mutate({
        businessShortcode: "123456",
        consumerKey: "ck",
        consumerSecret: "bad",
        passkey: "pk",
      }),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("invalid consumer secret");
  });
});
