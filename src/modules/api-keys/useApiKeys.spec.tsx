import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "./useApiKeys";
import { listApiKeys, createApiKey, revokeApiKey } from "./api-keys.api";
import type { ApiKeySummary } from "./api-keys.api";

// api-keys.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers what useApiKeys.ts itself is responsible
// for: create/revoke invalidating the ["api-keys"] query so an active list
// view actually refetches after a mutation, not just the mutation succeeding.
jest.mock("./api-keys.api", () => ({
  listApiKeys: jest.fn(),
  createApiKey: jest.fn(),
  revokeApiKey: jest.fn(),
}));

const mockListApiKeys = listApiKeys as jest.Mock;
const mockCreateApiKey = createApiKey as jest.Mock;
const mockRevokeApiKey = revokeApiKey as jest.Mock;

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

describe("useApiKeys", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lists api keys", async () => {
    mockListApiKeys.mockResolvedValue([mockKey]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useApiKeys(), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual([mockKey]));
  });

  it("useCreateApiKey invalidates the api-keys list on success, causing a refetch", async () => {
    mockListApiKeys.mockResolvedValue([mockKey]);
    mockCreateApiKey.mockResolvedValue({ id: "key-2", rawKey: "raw-secret", keyPrefix: "sk_live_def", scopes: ["read"] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(() => ({ list: useApiKeys(), create: useCreateApiKey() }), { wrapper });

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockListApiKeys).toHaveBeenCalledTimes(1);

    act(() => result.current.create.mutate(["read"]));

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
    await waitFor(() => expect(mockListApiKeys).toHaveBeenCalledTimes(2));
  });

  it("useRevokeApiKey invalidates the api-keys list on success, causing a refetch", async () => {
    mockListApiKeys.mockResolvedValue([mockKey]);
    mockRevokeApiKey.mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(() => ({ list: useApiKeys(), revoke: useRevokeApiKey() }), { wrapper });

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockListApiKeys).toHaveBeenCalledTimes(1);

    act(() => result.current.revoke.mutate("key-1"));

    await waitFor(() => expect(result.current.revoke.isSuccess).toBe(true));
    expect(mockRevokeApiKey).toHaveBeenCalledWith("key-1");
    await waitFor(() => expect(mockListApiKeys).toHaveBeenCalledTimes(2));
  });
});
