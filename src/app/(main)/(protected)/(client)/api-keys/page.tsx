import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { ApiKeysManager } from "@/modules/api-keys/ApiKeysManager";

export default function ApiKeysPage() {
  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>API Keys</PageHeading>
          <P className="text-muted-foreground">
            Use these to authenticate your own systems calling ScriptPay's payment endpoints directly.
          </P>
        </div>
        <ApiKeysManager />
      </SectionWrapper>
    </PageWrapper>
  );
}
