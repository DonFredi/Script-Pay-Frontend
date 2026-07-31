import PageWrapper from "@/shared/components/shared/PageWrapper";
import ContactForm from "./sections/ContactForm";
import PageHeading from "@/shared/components/shared/PageHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

export default function Contact() {
  return (
    <PageWrapper>
      <SectionWrapper>
        <PageHeading>Contact page</PageHeading>
      </SectionWrapper>
      <ContactForm />
    </PageWrapper>
  );
}
