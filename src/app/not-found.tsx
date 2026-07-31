import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { P } from "@/shared/components/ui/Typography";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageWrapper>
      <SectionWrapper className="text-center">
        <SectionHeading className="text-destructive">404</SectionHeading>
        <P className="my-2">Page you are looking for does not exist</P>
        <Link href="/" className="font-medium hover:scale-105 active:scale-95 duration-300 ease-in-out underline p-1">
          Go to Homepage
        </Link>
      </SectionWrapper>
    </PageWrapper>
  );
}
