import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import StkPushSection from "./sections/StkPushSection";
import ViewDocs from "./components/ViewDocs";

const PaymentsPage = () => {
  return (
    <PageWrapper>
      <SectionWrapper className="pb-0">
        <PageHeading>Payments</PageHeading>
        <P className="text-muted-foreground">Send an M-Pesa payment prompt and track it in real time.</P>
      </SectionWrapper>
      <StkPushSection />
      <ViewDocs />
    </PageWrapper>
  );
};
export default PaymentsPage;
