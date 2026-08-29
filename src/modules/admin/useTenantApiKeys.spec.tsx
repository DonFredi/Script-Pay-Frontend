import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateTenantApiKey, useRevokeTenantApiKey, useTenantApiKeys } from "./useTenantApiKeys";
import { createTenantApiKey, listTenantApiKeys, revokeTenantApiKey } from "./api-keys.api";
import type { ApiKeySummary } from "./api-keys.api";

// api-keys.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers what useTenantApiKeys.ts itself is
// responsible for: enabled-only-with-a-tenantId gating, and the create/revoke
// mutations invalidating this specific tenant's key list on success.
jest.mock("./api-keys.api", () => ({
  listTenantApiKeys: jest.fn(),
  createTenantApiKey: jest.fn(),
  revokeTenantApiKey: jest.fn(),
}));

const mockListTenantApiKeys = listTenantApiKeys as jest.Mock;
const mockCreateTenantApiKey = createTenantApiKey as jest.Mock;
const mockRevokeTenantApiKey = revokeTenantApiKey as jest.Mock;

const mockKey: ApiKeySummary = {
  id: "key-1",
  keyPrefix: "sk_live_abc",
  scopes: ["read"],
  lastUsedAt: null,
  revokedAt: null,
  expiresAt: null,
  createdAt: "2026-08-25T00:00:00.000Z",
};

const makeWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useTenantApiKeys", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fetch when tenantId is empty", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderHook(() => useTenantApiKeys(""), { wrapper: makeWrapper(queryClient) });
    expect(mockListTenantApiKeys).not.toHaveBeenCalled();
  });

  it("lists api keys for the given tenant", async () => {
    mockListTenantApiKeys.mockResolvedValue([mockKey]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useTenantApiKeys("tenant-1"), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual([mockKey]));
    expect(mockListTenantApiKeys).toHaveBeenCalledWith("tenant-1");
  });

  it("useRevokeTenantApiKey invalidates this tenant's key list on success", async () => {
    mockListTenantApiKeys.mockResolvedValue([mockKey]);
    mockRevokeTenantApiKey.mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(
      () => ({ list: useTenantApiKeys("tenant-1"), revoke: useRevokeTenantApiKey("tenant-1") }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockListTenantApiKeys).toHaveBeenCalledTimes(1);

    act(() => result.current.revoke.mutate("key-1"));

    await waitFor(() => expect(result.current.revoke.isSuccess).toBe(true));
    expect(mockRevokeTenantApiKey).toHaveBeenCalledWith("tenant-1", "key-1");
    await waitFor(() => expect(mockListTenantApiKeys).toHaveBeenCalledTimes(2));
  });

  it("useCreateTenantApiKey invalidates this tenant's key list on success", async () => {
    mockListTenantApiKeys.mockResolvedValue([mockKey]);
    mockCreateTenantApiKey.mockResolvedValue({ ...mockKey, id: "key-2" });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(
      () => ({ list: useTenantApiKeys("tenant-1"), create: useCreateTenantApiKey("tenant-1") }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockListTenantApiKeys).toHaveBeenCalledTimes(1);

    act(() => result.current.create.mutate({ scopes: ["PAYMENTS_READ"] }));

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
    expect(mockCreateTenantApiKey).toHaveBeenCalledWith("tenant-1", ["PAYMENTS_READ"], undefined);
    await waitFor(() => expect(mockListTenantApiKeys).toHaveBeenCalledTimes(2));
  });
});
