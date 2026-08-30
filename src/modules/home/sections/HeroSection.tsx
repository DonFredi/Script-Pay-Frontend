import Link from "next/link";
import Image from "next/image";
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
         
          <h1>Send and receive M-Pesa payments without the setup headache</h1>
          <p className="text-foreground-muted text-lg">
            Collect via STK Push, Paybill, and Till, or disburse funds straight out with B2C payouts — all from one
            dashboard, with automatic reconciliation and a full audit trail, so you always know where a payment
            actually stands.
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
        {/* The artwork is deliberately greyscale so it sits on the theme's neutral
            `--primary`; the M-Pesa mark is layered over it rather than baked into
            the file so it stays sharp at every viewport, keeps Safaricom's own
            brand colour as the single point of contrast, and can be moved or
            swapped without re-exporting the image. */}
        <div className="relative w-full md:w-1/2">
          <Image
            src="/images/hero_section_image.webp"
            alt="ScriptPay dashboard preview"
            width={1536}
            height={1024}
            className="w-full h-auto rounded-2xl shadow-lg"
            priority
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-rad-lg border bg-card/90 p-2 shadow-lg backdrop-blur-sm sm:bottom-4 sm:left-4 sm:gap-3 sm:p-3">
            {/* alt="" — the adjacent label already names the mark, so announcing
                it again would only repeat itself for a screen reader. */}
            <Image
              src="/images/mpesa-logo.png"
              alt=""
              width={178}
              height={148}
              className="h-8 w-auto rounded-rad-xs sm:h-10"
            />
            <div className="pr-1">
              <p className="text-xs font-semibold leading-tight sm:text-sm">Powered by M-Pesa</p>
              <p className="text-caption-xs text-foreground-muted leading-tight">Safaricom Daraja</p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
};
export default HeroSection;
