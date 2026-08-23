import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import Shield from "../icons/Shield";
import Clock from "../icons/Clock";
import Code from "../icons/Code";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const HeroSection = () => {
  return (
    <SectionWrapper className="flex flex-col md:flex-row md:items-center gap-8">
      <div className="w-full md:w-1/2 space-y-4">
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-caption-sm">
          🔔 Built for businesses
        </span>
        <h1>Accept M-Pesa payments in seconds</h1>
        <p className="text-foreground-muted">
          Powerful, secure and reliable API for STK Push, transaction tracking and real-time callbacks.
        </p>
        <div className="flex flex-row gap-4 my-4">
          <Button asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
          <Button variant="secondary" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        <div className="flex flex-row flex-wrap justify-start gap-6 my-6">
          <Shield />
          <Clock />
          <Code />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <img
          src="/images/hero_section_image.png"
          alt="ScriptPay dashboard preview"
          className="w-full h-auto rounded-2xl"
        />
      </div>
    </SectionWrapper>
  );
};
export default HeroSection;
