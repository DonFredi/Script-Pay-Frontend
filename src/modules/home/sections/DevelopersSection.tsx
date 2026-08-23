import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const points = [
  "REST API, scoped API keys, and per-tenant rate limiting out of the box",
  "Idempotent webhooks with documented retry behavior",
  "Sandbox-friendly: test STK Push, Paybill, and Till flows before going live",
  "Every credential — yours and your customers' — encrypted at rest",
];

const DevelopersSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2 space-y-4">
          <h2>Ready when your engineers are</h2>
          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-foreground-muted">{point}</span>
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/auth/register">Get API Access</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/2">
          <pre className="overflow-x-auto rounded-2xl border bg-foreground text-background p-5 text-xs leading-relaxed shadow-lg">
            <code>{`POST /v1/payments/stk-push
Authorization: Bearer sk_live_************
Content-Type: application/json

{
  "phoneNumber": "2547XXXXXXXX",
  "amount": 1500,
  "accountReference": "INV-2481",
  "transactionDesc": "Order #2481"
}

→ 202 Accepted
{ "status": "PENDING", "checkoutRequestId": "ws_CO_..." }`}</code>
          </pre>
        </div>
      </div>
    </SectionWrapper>
  );
};
export default DevelopersSection;
