import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTenant, useTenants, useUpdateTenantStatus } from "./useTenants";
import { getTenant, listTenants, updateTenantStatus } from "./tenants.api";
import type { Tenant } from "./tenants.api";

// tenants.api.ts's own request/response handling is covered by
// api-client.spec.ts. This covers what useTenants.ts itself is responsible
// for: useTenant's enabled-only-with-an-id gating, and
// useUpdateTenantStatus invalidating both the single-tenant and list queries
// on success so an admin's status change is reflected without a manual reload.
jest.mock("./tenants.api", () => ({
  listTenants: jest.fn(),
  getTenant: jest.fn(),
  updateTenantStatus: jest.fn(),
}));

const mockListTenants = listTenants as jest.Mock;
const mockGetTenant = getTenant as jest.Mock;
const mockUpdateTenantStatus = updateTenantStatus as jest.Mock;

const mockTenant: Tenant = {
  id: "tenant-1",
  name: "Acme",
  businessShortcode: "123456",
  status: "active",
  createdAt: "2026-08-25T00:00:00.000Z",
};

const makeWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useTenants", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lists tenants", async () => {
    mockListTenants.mockResolvedValue([mockTenant]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useTenants(), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual([mockTenant]));
  });
});

describe("useTenant", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fetch when id is empty", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderHook(() => useTenant(""), { wrapper: makeWrapper(queryClient) });
    expect(mockGetTenant).not.toHaveBeenCalled();
  });

  it("fetches the tenant by id when given one", async () => {
    mockGetTenant.mockResolvedValue(mockTenant);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useTenant("tenant-1"), { wrapper: makeWrapper(queryClient) });

    await waitFor(() => expect(result.current.data).toEqual(mockTenant));
    expect(mockGetTenant).toHaveBeenCalledWith("tenant-1");
  });
});

describe("useUpdateTenantStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("invalidates both the single-tenant and list queries on success", async () => {
    mockGetTenant.mockResolvedValue(mockTenant);
    mockListTenants.mockResolvedValue([mockTenant]);
    mockUpdateTenantStatus.mockResolvedValue({ ...mockTenant, status: "suspended" });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(
      () => ({ tenant: useTenant("tenant-1"), list: useTenants(), update: useUpdateTenantStatus("tenant-1") }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.tenant.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockGetTenant).toHaveBeenCalledTimes(1);
    expect(mockListTenants).toHaveBeenCalledTimes(1);

    act(() => result.current.update.mutate("suspended"));

    await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
    expect(mockUpdateTenantStatus).toHaveBeenCalledWith("tenant-1", "suspended");
    // Both invalidateQueries calls target this tenant's detail query — the
    // explicit ["admin","tenants",id] filter, and the broader
    // ["admin","tenants"] one too (react-query matches by key prefix, so the
    // list-level filter also matches the detail query). That's a harmless
    // double-refetch of the same data, not a correctness bug — hence >= 2
    // rather than a strict count here.
    await waitFor(() => expect(mockGetTenant.mock.calls.length).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(mockListTenants).toHaveBeenCalledTimes(2));
  });
});
