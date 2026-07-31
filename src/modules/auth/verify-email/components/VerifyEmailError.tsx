import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { XIcon } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailError() {
  return (
    <SectionWrapper className="flex flex-col gap-4 items-center">
      <XIcon className="size-20 text-destructive" />
      <SectionHeading className="text-center">This verification link is invalid or has expired</SectionHeading>
      {/* Previously linked to /auth/forgot-password — that's the PASSWORD reset
          flow, not email verification. /auth/verify-email (no token) is what
          actually shows the "resend verification email" action. */}
      <Link href="/auth/verify-email" className="font-medium p-1 underline">
        Resend verification email
      </Link>
    </SectionWrapper>
  );
}
