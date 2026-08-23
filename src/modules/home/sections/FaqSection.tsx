import { ChevronDown } from "lucide-react";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const faqs = [
  {
    question: "Do I need a Paybill or Till number already?",
    answer:
      "Yes — you'll need your own Safaricom Paybill/Till and Daraja API credentials. ScriptPay doesn't provide these, it integrates with the ones you already have.",
  },
  {
    question: "What happens if a webhook fails to reach me?",
    answer:
      "ScriptPay's reconciliation process checks transaction status directly against Safaricom on a schedule, so your dashboard stays accurate even if a callback is missed.",
  },
  {
    question: "Can multiple staff members use one account?",
    answer:
      "Yes — tenant admins can create staff logins with more limited permissions, for example without access to audit logs.",
  },
];

const FaqSection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="mb-8 text-center">
        <h2>Frequently asked questions</h2>
      </div>
      <div className="mx-auto flex w-full max-w-180 flex-col divide-y divide-border rounded-2xl border bg-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {faq.question}
              <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-foreground-muted text-sm">{faq.answer}</p>
          </details>
        ))}
      </div>
    </SectionWrapper>
  );
};
export default FaqSection;
