import { Smartphone, Layers, RefreshCw, Webhook, BellRing, ScrollText, KeyRound, BarChart3 } from "lucide-react";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const features = [
  {
    id: 1,
    icon: Smartphone,
    title: "Two ways to get paid",
    description:
      "Trigger STK Push from your own backend via API key, or send a payment prompt straight from the dashboard — no code required for your ops team.",
  },
  {
    id: 2,
    icon: Layers,
    title: "Paybill, Till, or STK Push",
    description: "Collect however your customers already pay — one integration covers all three Safaricom channels.",
  },
  {
    id: 3,
    icon: RefreshCw,
    title: "Payments that reconcile themselves",
    description:
      "ScriptPay actively checks every transaction against Safaricom's own status API and catches drift automatically.",
  },
  {
    id: 4,
    icon: Webhook,
    title: "Webhooks that don't drop",
    description:
      "Callbacks are ingested idempotently and processed with automatic retry, so a slow response on your end doesn't mean a lost payment update.",
  },
  {
    id: 5,
    icon: BellRing,
    title: "Know the moment something breaks",
    description: "Failed payments and processing errors trigger real-time alerts — you find out before your customer does.",
  },
  {
    id: 6,
    icon: ScrollText,
    title: "A real audit trail",
    description:
      "Every sensitive action — credential changes, status updates, Daraja interactions — is logged and reviewable.",
  },
  {
    id: 7,
    icon: KeyRound,
    title: "Scoped API keys",
    description: "Issue keys limited to exactly what an integration needs, and revoke them individually.",
  },
  {
    id: 8,
    icon: BarChart3,
    title: "Reporting that answers the real question",
    description: "Success rate, per-status breakdowns, and drift counts over any window — not just a raw transaction list.",
  },
];

const FeaturesSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="mb-10 text-center">
        <h2>Everything you need to accept payments</h2>
        <p className="text-foreground-muted">One integration, the whole M-Pesa payment lifecycle.</p>
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
