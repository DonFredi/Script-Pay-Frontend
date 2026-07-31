import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { P } from "@/shared/components/ui/Typography";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordError() {
  const router = useRouter();
  return (
    <SectionWrapper className="flex flex-col gap-2 items-center">
      <XIcon className="size-20 text-destructive" />
      <SectionHeading>Token invalid or expired</SectionHeading>
      <P>This reset link is invalid or has expired</P>
      <Button onClick={() => router.push("/auth/forgot-password")} className="my-2">
        Request new link
      </Button>
    </SectionWrapper>
  );
}
