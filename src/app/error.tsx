"use client";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <PageWrapper>
      <SectionWrapper className="flex flex-col gap-2 justify-start">
        <h2 className="text-red-500 font-bold">Error</h2>
        <p className="">Something has gone wrong, please try again!</p>
        <p className="">{error.message}</p>
        <Button onClick={() => reset()} className="w-fit">
          Try again
        </Button>
      </SectionWrapper>
    </PageWrapper>
  );
}
