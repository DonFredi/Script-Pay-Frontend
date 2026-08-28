"use client";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { H4, P } from "@/shared/components/ui/Typography";
import { ChevronLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import VerifyEmailSuccess from "./VerifyEmailSuccess";
import { useEffect } from "react";
import { useVerifyEmail } from "../useVerifyEmail";
import VerifyEmailError from "./VerifyEmailError";
import { useResendVerification } from "../../resend-verification/useResendVerification";

export default function VerifyEmailUI() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mutateAsync, isPending, isError, isSuccess } = useVerifyEmail();
  const { mutateAsync: resendEmail, isPending: isResending } = useResendVerification();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const handleVerifyEmail = async (token: string) => {
    try {
      await mutateAsync(token);
    } catch {
      // Error already surfaces via useVerifyEmail's own toast.error handler —
      // this catch just prevents an unhandled promise rejection.
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      router.push("/auth/forgot-password");
      return;
    }
    try {
      await resendEmail(email);
    } catch {
      // Error already surfaces via useResendVerification's own toast.error handler.
    }
  };

  useEffect(() => {
    if (!token) return;
    handleVerifyEmail(token);
    // Intentional run-once-on-mount: verify whatever token was in the URL when
    // this page loaded; re-running on identity changes of the callback/token
    // would just re-fire the same verification request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (token && isPending) return <H4 className="mx-auto">Verifying...</H4>;
  if (token && isSuccess) return <VerifyEmailSuccess />;
  if (token && isError) return <VerifyEmailError />;

  return (
    <SectionWrapper className="flex flex-col items-center gap-4">
      <Mail className="size-20 text-primary" />
      <SectionHeading>Verify your email</SectionHeading>
      <div className="text-center">
        <P>We’ve sent a verification link to your email address.</P>
        <P>Please check your inbox and click the link to activate your account.</P>
      </div>
      <Link href="/auth/login" className="font-medium p-1 flex items-center gap-2">
        <ChevronLeft className="size-6" />
        <span className="">Back to login</span>
      </Link>
      <div className="w-full border-t border-border pt-5 max-w-125 flex items-center mt-2 flex-col gap-2">
        <small className="text-sm text-muted-foreground">Didn&apos;t receive the email? check your spam folder</small>
        <Button
          onClick={() => handleResendVerification()}
          disabled={isResending}
          variant="secondary"
          className="py-1 px-2 w-fit"
        >
          {isResending ? "Resending..." : "Resend email"}
        </Button>
      </div>
    </SectionWrapper>
  );
}
