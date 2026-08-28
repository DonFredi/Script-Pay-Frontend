import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { H3, P } from "@/shared/components/ui/Typography";
import { generateSEO } from "@/shared/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Terms of Service",
  url: "/terms",
});

const EFFECTIVE_DATE = "August 28, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <H3>{title}</H3>
      <div className="flex flex-col gap-2 text-foreground-muted">{children}</div>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <PageWrapper>
      <SectionWrapper className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
        <div className="flex flex-col gap-2">
          <SectionHeading>Terms of Service</SectionHeading>
          <P className="text-sm text-foreground-muted">Effective date: {EFFECTIVE_DATE}</P>
          <P className="text-sm text-foreground-muted italic">
            This is a working draft prepared for {siteConfig.name}&apos;s launch and has not yet been reviewed by
            counsel. Treat it as a starting point, not a final compliance document, until it has been.
          </P>
        </div>

        <Section title="1. Acceptance of these terms">
          <P>
            By creating an account or using {siteConfig.name} (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service and our{" "}
            <a href="/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            . If you are using the Service on behalf of a business, you confirm you have authority to bind that
            business to these terms.
          </P>
        </Section>

        <Section title="2. What the service is">
          <P>
            {siteConfig.name} is a merchant dashboard that lets Kenyan businesses accept M-Pesa payments (STK Push,
            Paybill, and Till) through Safaricom&apos;s Daraja API, with reconciliation, transaction history, and an
            audit trail. {siteConfig.name} is a technology intermediary: we never hold, custody, or move your funds
            ourselves — every payment is executed and settled directly by Safaricom via the Daraja API into your own
            configured M-Pesa account.
          </P>
        </Section>

        <Section title="3. Eligibility and account registration">
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>You must be a legally registered business (or authorized representative of one) operating in Kenya, or otherwise permitted to hold a Safaricom merchant account.</li>
            <li>You must provide accurate account and business information, and keep it up to date.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials and any API keys issued to your account, and for all activity that occurs under them.</li>
          </ul>
        </Section>

        <Section title="4. Your obligations as a merchant">
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>Comply with Safaricom&apos;s own merchant/Daraja terms and applicable Kenyan law, including consumer protection and data protection law.</li>
            <li>Use the Service only for lawful goods, services, and payment purposes — not for fraud, money laundering, or any prohibited use under Safaricom&apos;s policies.</li>
            <li>Not attempt to circumvent, probe, or interfere with the Service&apos;s security, rate limits, or authentication mechanisms.</li>
            <li>Safeguard any API keys issued to you; a compromised key should be revoked and rotated immediately via your account.</li>
          </ul>
        </Section>

        <Section title="5. Payments, fees, and settlement">
          <P>
            Funds from a successful M-Pesa transaction settle according to Safaricom&apos;s own Daraja settlement
            timelines and rules — not ours. Any subscription or transaction fees for using {siteConfig.name} itself
            (as opposed to Safaricom&apos;s own charges) will be disclosed to you separately at the time they apply.
            We do not control, and are not responsible for, Safaricom&apos;s own fees, downtime, or transaction
            limits.
          </P>
        </Section>

        <Section title="6. Service availability">
          <P>
            We aim to keep the Service available and reliable but do not guarantee uninterrupted access. The Service
            depends on Safaricom&apos;s Daraja API being available; outages, rate limits, or changes on Safaricom&apos;s
            side are outside our control. The Service is provided &quot;as is&quot; and &quot;as available&quot;,
            without warranties of any kind beyond what is required by applicable law.
          </P>
        </Section>

        <Section title="7. Limitation of liability">
          <P>
            To the maximum extent permitted by law, {siteConfig.name} is not liable for indirect, incidental, or
            consequential damages arising from your use of the Service, including losses caused by Safaricom-side
            outages, delays, or transaction failures outside our control. Nothing in these terms limits liability
            that cannot be limited under Kenyan law.
          </P>
        </Section>

        <Section title="8. Suspension and termination">
          <P>
            We may suspend or terminate an account that violates these terms, is used fraudulently, or poses a
            security risk to the Service or other merchants. You may close your account at any time by contacting
            us; some transaction records will be retained afterward as described in our{" "}
            <a href="/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            .
          </P>
        </Section>

        <Section title="9. Changes to these terms">
          <P>
            We may update these terms as the Service evolves. Material changes will be reflected by updating the
            effective date above; continued use of the Service after a change constitutes acceptance of the revised
            terms.
          </P>
        </Section>

        <Section title="10. Governing law">
          <P>These terms are governed by the laws of the Republic of Kenya.</P>
        </Section>

        <Section title="11. Contact us">
          <P>
            Questions about these terms can be directed to{" "}
            <a href={siteConfig.contact.email.link} className="text-primary underline">
              {siteConfig.contact.email.label}
            </a>
            {siteConfig.contact.phone.label ? (
              <>
                {" "}or{" "}
                <a href={siteConfig.contact.phone.link} className="text-primary underline">
                  {siteConfig.contact.phone.label}
                </a>
                .
              </>
            ) : (
              "."
            )}
          </P>
        </Section>
      </SectionWrapper>
    </PageWrapper>
  );
}
