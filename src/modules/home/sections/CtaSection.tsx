import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const CtaSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
        <h2 className="text-primary-foreground">Ready to stop stressing over M-Pesa payments?</h2>
        <p className="max-w-140 text-primary-foreground/80">
          Register in minutes and start accepting STK Push, Paybill, and Till payments today.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/auth/register">Get Started</Link>
        </Button>
      </div>
    </SectionWrapper>
  );
};
export default CtaSection;
