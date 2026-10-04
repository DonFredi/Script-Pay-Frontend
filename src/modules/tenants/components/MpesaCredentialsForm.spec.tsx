import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MpesaCredentialsForm } from "./MpesaCredentialsForm";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { useCreateShortcode } from "../useTenantShortcodes";

jest.mock("@/modules/auth/shared/hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("../useMpesaCredentials", () => ({
  useSetMpesaCredentials: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock("../useTenantShortcodes", () => ({
  useTenantShortcodes: () => ({ data: [], isLoading: false }),
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
