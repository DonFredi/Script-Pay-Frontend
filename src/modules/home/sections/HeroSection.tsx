import Link from "next/link";
import { ShieldCheck, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const trustPoints = [
  { icon: ShieldCheck, label: "Encrypted credentials" },
  { icon: RefreshCw, label: "Self-reconciling payments" },
  { icon: Smartphone, label: "Powered by Safaricom M-Pesa" },
];

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-100 w-100 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <SectionWrapper className="flex flex-col md:flex-row md:items-center gap-8 py-12 md:py-16">
        <div className="w-full md:w-1/2 space-y-5">
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-caption-sm">
            🔔 Built for Kenyan businesses
          </span>
          <h1>Accept M-Pesa payments without the setup headache</h1>
          <p className="text-foreground-muted text-lg">
            STK Push, Paybill, and Till — all from one dashboard, with automatic reconciliation and a full audit
            trail, so you always know where a payment actually stands.
          </p>
          <div className="flex flex-row flex-wrap gap-4 my-4">
            <Button size="lg" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <div className="flex flex-row flex-wrap justify-start gap-x-6 gap-y-3 pt-2">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-row items-center gap-2">
                <Icon size={20} strokeWidth={2} className="text-green-600" />
                <span className="text-sm text-foreground-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <img
            src="/images/hero_section_image.png"
            alt="ScriptPay dashboard preview"
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>
      </SectionWrapper>
    </div>
  );
};
export default HeroSection;
