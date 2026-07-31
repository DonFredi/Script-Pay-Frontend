import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Check } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailSuccess() {
  return (
    <SectionWrapper className="flex flex-col gap-4 items-center">
      <Check className="size-20 text-success" />
      <SectionHeading>Email verified successfully</SectionHeading>
      <Link href="/auth/login" className="font-medium p-1 underline">
        Continue to login
      </Link>
    </SectionWrapper>
  );
}
