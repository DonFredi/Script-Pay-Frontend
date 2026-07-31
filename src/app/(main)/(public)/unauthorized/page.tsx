import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { H4 } from "@/shared/components/ui/Typography";

export default function UnauthorizedPage() {
  return (
    <PageWrapper>
      <SectionWrapper className="flex items-center flex-col gap-2">
        <SectionHeading className="text-destructive">Unauthorized</SectionHeading>
        <H4>You do not have permission to access this page</H4>
      </SectionWrapper>
    </PageWrapper>
  );
}
