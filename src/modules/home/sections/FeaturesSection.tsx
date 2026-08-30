import {
  Smartphone,
  Layers,
  ArrowLeftRight,
  RefreshCw,
  Webhook,
  BellRing,
  ScrollText,
  KeyRound,
  BarChart3,
} from "lucide-react";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const features = [
  {
    id: 1,
    icon: Smartphone,
    title: "Send payment prompts in seconds",
    description:
      "Trigger an STK Push straight from your dashboard — no developer or code required. Plug it into your own systems later, if and when you need to.",
  },
  {
    id: 2,
    icon: Layers,
    title: "Paybill, Till, or STK Push",
    description: "Collect however your customers already pay — one integration covers all three Safaricom channels.",
  },
  {
    id: 3,
    icon: ArrowLeftRight,
    title: "Send payouts, not just collect",
    description:
      "Disburse funds straight to a customer's M-Pesa number with B2C payouts — from the same dashboard, tracked separately from your revenue.",
  },
  {
    id: 4,
    icon: RefreshCw,
    title: "Payments that reconcile themselves",
    description:
      "ScriptPay actively checks every transaction against Safaricom's own records and catches drift automatically.",
  },
  {
    id: 5,
    icon: Webhook,
    title: "Never miss a payment update",
    description:
      "Every status update is delivered reliably and retried automatically, so a temporary hiccup never means a lost payment record.",
  },
  {
    id: 6,
    icon: BellRing,
    title: "Know the moment something breaks",
    description: "Failed payments and processing errors trigger real-time alerts — you find out before your customer does.",
  },
  {
    id: 7,
    icon: ScrollText,
    title: "A real audit trail",
    description:
      "Every sensitive action — credential changes, status updates, M-Pesa activity — is logged and reviewable.",
  },
  {
    id: 8,
    icon: KeyRound,
    title: "Secure by default, extensible when you need it",
    description:
      "Your account is protected from day one. Want to connect your own systems later? Scoped access keys make sure they only ever do exactly what you allow.",
  },
  {
    id: 9,
    icon: BarChart3,
    title: "Reporting that answers the real question",
    description: "Success rate, per-status breakdowns, and drift counts over any window — not just a raw transaction list.",
  },
];

const FeaturesSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="mb-10 text-center">
        <h2>Everything you need to accept and send payments</h2>
        <p className="text-foreground-muted">One dashboard, the whole M-Pesa payment lifecycle.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Icon size={20} strokeWidth={2} className="text-primary" />
              </div>
              <h5 className="mb-2">{feature.title}</h5>
              <p className="text-foreground-muted text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
export default FeaturesSection;
