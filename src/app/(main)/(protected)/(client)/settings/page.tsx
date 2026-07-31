import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import { P } from "@/shared/components/ui/Typography";
import { MpesaCredentialsForm } from "@/modules/tenants/components/MpesaCredentialsForm";

/**
 * General tenant settings (business details, notification preferences) still
 * aren't built on the backend — that placeholder note stays true and relevant.
 * M-Pesa credentials, however, ARE backed by a real endpoint now
 * (POST /v1/tenants/:id/mpesa-credentials) and belong here rather than staying
 * blocked behind curl commands.
 */
export default function SettingsPage() {
  return (
    <SectionWrapper className="space-y-8">
      <div>
        <SectionHeading>Settings</SectionHeading>
        <P className="text-muted-foreground">Manage your M-Pesa integration and business settings.</P>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-1">M-Pesa Credentials</h2>
        <P className="text-sm text-muted-foreground mb-4">
          Required before you can send STK Push, Paybill, or Till payment prompts.
        </P>
        <MpesaCredentialsForm />
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-medium mb-1">Business Details & Notifications</h2>
        <P className="text-sm text-muted-foreground">
          Not built yet on the backend — this section is a placeholder until those endpoints exist.
        </P>
      </div>
    </SectionWrapper>
  );
}
