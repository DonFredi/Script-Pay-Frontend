import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MpesaCredentialsForm } from "./MpesaCredentialsForm";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { useCreateShortcode, useTenantShortcodes, useUpdateShortcode } from "../useTenantShortcodes";

jest.mock("@/modules/auth/shared/hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("../useMpesaCredentials", () => ({
  useSetMpesaCredentials: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock("../useTenantShortcodes", () => ({
  useTenantShortcodes: jest.fn(),
  useUpdateShortcode: jest.fn(),
  useRemoveShortcode: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useSetDefaultShortcode: () => ({ mutate: jest.fn(), isPending: false, variables: undefined }),
  useCreateShortcode: jest.fn(),
}));
// Radix Select doesn't open in jsdom; a native <select> exercises the same
// onValueChange path the form relies on.
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <select aria-label="Type" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
}));

// The Radix Checkbox measures itself; jsdom has no ResizeObserver.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockUseAuth = useAuth as jest.Mock;
const mockUseCreateShortcode = useCreateShortcode as jest.Mock;
const mockUseTenantShortcodes = useTenantShortcodes as jest.Mock;
const mockUseUpdateShortcode = useUpdateShortcode as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReturnValue({ user: { tenantId: "t-1" } });
  mockUseTenantShortcodes.mockReturnValue({ data: [], isLoading: false });
  mockUseUpdateShortcode.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

describe("AddShortcodeForm", () => {
  it("drops a passkey left over from the Paybill view when the shortcode is switched to B2C", async () => {
    const createShortcode = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ user: { tenantId: "t-1" } });
    mockUseCreateShortcode.mockReturnValue({ mutateAsync: createShortcode, isPending: false });

    render(<MpesaCredentialsForm />);
    fireEvent.click(screen.getByRole("button", { name: "Add shortcode" }));

    // Form opens on PAYBILL; a passkey gets filled (typed or browser-autofilled).
    fireEvent.change(screen.getByLabelText("Passkey"), { target: { value: "autofilled-password" } });

    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "B2C" } });
    fireEvent.change(screen.getByLabelText("Shortcode"), { target: { value: "600992" } });
    fireEvent.change(screen.getByLabelText("Initiator Name"), { target: { value: "testapi" } });
    fireEvent.change(screen.getByLabelText("Security Credential"), { target: { value: "ENCRYPTED==" } });
    fireEvent.click(screen.getByRole("button", { name: "Add shortcode" }));

    await waitFor(() => expect(createShortcode).toHaveBeenCalledTimes(1));
    expect(createShortcode).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "B2C",
        shortcode: "600992",
        initiatorName: "testapi",
        securityCredential: "ENCRYPTED==",
        passkey: undefined,
      }),
    );
    expect(screen.queryByText(/needs a passkey/)).not.toBeInTheDocument();
  });
});

describe("EditShortcodeForm", () => {
  const b2cRow = {
    id: "sc-b2c",
    type: "B2C",
    shortcode: "600992",
    isDefault: true,
    stkConfigured: false,
    payoutConfigured: true,
    createdAt: "2026-08-31T00:00:00Z",
  };
  const paybillRow = { ...b2cRow, id: "sc-pb", type: "PAYBILL", shortcode: "174379", stkConfigured: true, payoutConfigured: false };

  it("sends only the new initiator name and security credential for a B2C shortcode", async () => {
    const updateShortcode = jest.fn().mockResolvedValue(undefined);
    mockUseTenantShortcodes.mockReturnValue({ data: [b2cRow, paybillRow], isLoading: false });
    mockUseUpdateShortcode.mockReturnValue({ mutateAsync: updateShortcode, isPending: false });

    render(<MpesaCredentialsForm />);
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    expect(screen.queryByLabelText("Passkey")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Initiator Name"), { target: { value: "testapi" } });
    fireEvent.change(screen.getByLabelText("Security Credential"), { target: { value: "NEWCRED==" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateShortcode).toHaveBeenCalledTimes(1));
    expect(updateShortcode).toHaveBeenCalledWith({
      id: "sc-b2c",
      data: { initiatorName: "testapi", securityCredential: "NEWCRED==" },
    });
  });

  it("requires both B2C fields instead of saving half a credential", async () => {
    const updateShortcode = jest.fn();
    mockUseTenantShortcodes.mockReturnValue({ data: [b2cRow], isLoading: false });
    mockUseUpdateShortcode.mockReturnValue({ mutateAsync: updateShortcode, isPending: false });

    render(<MpesaCredentialsForm />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Security Credential"), { target: { value: "NEWCRED==" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Initiator name is required")).toBeInTheDocument();
    expect(updateShortcode).not.toHaveBeenCalled();
  });

  it("sends only a passkey for a Paybill shortcode", async () => {
    const updateShortcode = jest.fn().mockResolvedValue(undefined);
    mockUseTenantShortcodes.mockReturnValue({ data: [paybillRow], isLoading: false });
    mockUseUpdateShortcode.mockReturnValue({ mutateAsync: updateShortcode, isPending: false });

    render(<MpesaCredentialsForm />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByLabelText("Initiator Name")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Passkey"), { target: { value: "new-passkey" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateShortcode).toHaveBeenCalledWith({ id: "sc-pb", data: { passkey: "new-passkey" } }));
  });
});
