import { render, screen } from "@testing-library/react";
import TenantStatusBanner from "./TenantStatusBanner";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { useTenant } from "@/modules/admin/useTenants";

jest.mock("@/modules/auth/shared/hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("@/modules/admin/useTenants", () => ({ useTenant: jest.fn() }));
const mockUseAuth = useAuth as jest.Mock;
const mockUseTenant = useTenant as jest.Mock;

describe("TenantStatusBanner", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { tenantId: "t-1" } });
  });

  it("renders nothing for an active tenant or while the tenant is loading", () => {
    mockUseTenant.mockReturnValue({ data: { id: "t-1", status: "active" } });
    const { container, rerender } = render(<TenantStatusBanner />);
    expect(container).toBeEmptyDOMElement();

    mockUseTenant.mockReturnValue({ data: undefined });
    rerender(<TenantStatusBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("tells a pending_kyc tenant they await approval and can still set up credentials", () => {
    mockUseTenant.mockReturnValue({ data: { id: "t-1", status: "pending_kyc" } });
    render(<TenantStatusBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("awaiting approval");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("warns a suspended or removed tenant that payments are disabled", () => {
    mockUseTenant.mockReturnValue({ data: { id: "t-1", status: "suspended" } });
    const { rerender } = render(<TenantStatusBanner />);
    expect(screen.getByRole("alert")).toHaveTextContent("suspended");

    mockUseTenant.mockReturnValue({ data: { id: "t-1", status: "removed" } });
    rerender(<TenantStatusBanner />);
    expect(screen.getByRole("alert")).toHaveTextContent("deactivated");
  });
});
