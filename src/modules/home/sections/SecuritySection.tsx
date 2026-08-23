import { Lock, KeyRound, ShieldCheck, ScrollText } from "lucide-react";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const points = [
  { icon: Lock, text: "Daraja credentials encrypted at rest, never exposed after saving" },
  { icon: KeyRound, text: "Passwords and API keys hashed with argon2" },
  { icon: ShieldCheck, text: "CSRF-protected dashboard, role-based access for staff vs. admins" },
  { icon: ScrollText, text: "Full audit log of every sensitive action" },
];

const SecuritySection = () => {
  return (
    <SectionWrapper className="py-10">
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6 text-center">
          <h2>Security isn&apos;t an afterthought</h2>
          <p className="text-foreground-muted">The parts of a payments platform you can&apos;t see, done right.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Icon size={20} strokeWidth={2} className="text-primary" />
              </div>
              <p className="text-sm text-foreground-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
export default SecuritySection;
