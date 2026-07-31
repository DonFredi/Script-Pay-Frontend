import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { P } from "@/shared/components/ui/Typography";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordSuccess() {
  const router = useRouter();
  return (
    <SectionWrapper className="flex flex-col gap-2 items-center">
      <Check className="size-20 text-success" />
      <SectionHeading>Password updated</SectionHeading>
      <P>Your password has been successfully reset</P>
      <Button onClick={() => router.push("/auth/login")} className="my-2">
        Back to login
      </Button>
    </SectionWrapper>
  );
}
