import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const points = [
  "Send a payment prompt straight from your dashboard — no developer required",
  "Every transaction reconciles itself, so your books stay accurate",
  "Test everything risk-free in sandbox before you go live",
  "Every credential — yours and your customers' — encrypted at rest",
];

const EaseOfUseSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2 space-y-4">
          <h2>Set up in an afternoon, no developers required</h2>
          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-foreground-muted">{point}</span>
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/2">
          <div className="rounded-2xl border bg-card p-6 shadow-lg space-y-4">
            <p className="text-sm font-medium">Send Payment Request</p>
            <div className="space-y-3">
              <div className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground-muted">
                Phone Number · 0712 345 678
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground-muted">
                Amount · KES 1,500
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground-muted">
                Reference · INV-2481
              </div>
            </div>
            <div
              aria-hidden
              className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
            >
              Send Payment Request
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 size={16} strokeWidth={2} />
              Payment received — KES 1,500
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
export default EaseOfUseSection;
