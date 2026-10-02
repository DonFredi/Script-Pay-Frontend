import { render, screen } from "@testing-library/react";
import PendingTenantsBanner from "./PendingTenantsBanner";
import { usePendingTenants } from "@/modules/admin/useTenants";

jest.mock("@/modules/admin/useTenants", () => ({ usePendingTenants: jest.fn() }));
const mockUsePending = usePendingTenants as jest.Mock;

const tenant = (id: string, name: string) => ({ id, name, status: "pending_kyc", createdAt: "2026-09-29T03:32:58.000Z" });

describe("PendingTenantsBanner", () => {
  it("renders nothing while loading or when no tenant is pending", () => {
    mockUsePending.mockReturnValue({ data: undefined });
    const { container, rerender } = render(<PendingTenantsBanner />);
    expect(container).toBeEmptyDOMElement();

    mockUsePending.mockReturnValue({ data: [] });
    rerender(<PendingTenantsBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links a single pending tenant straight to its detail page", () => {
    mockUsePending.mockReturnValue({ data: [tenant("t-1", "Hills")] });
    render(<PendingTenantsBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("Hills");
    expect(screen.getByRole("link", { name: "Review tenant" })).toHaveAttribute("href", "/admin/tenants/t-1");
  });

  it("summarises several pending tenants and links to the list", () => {
    mockUsePending.mockReturnValue({ data: [tenant("t-1", "Hills"), tenant("t-2", "Acme")] });
    render(<PendingTenantsBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("2 tenants are waiting for KYC review (Hills, Acme)");
    expect(screen.getByRole("link", { name: "View tenants" })).toHaveAttribute("href", "/admin/dashboard");
  });
});
