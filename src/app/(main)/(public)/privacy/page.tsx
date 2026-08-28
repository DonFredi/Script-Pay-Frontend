import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionHeading from "@/shared/components/shared/SectionHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { H3, P } from "@/shared/components/ui/Typography";
import { generateSEO } from "@/shared/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Privacy Policy",
  url: "/privacy",
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

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <SectionWrapper className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
        <div className="flex flex-col gap-2">
          <SectionHeading>Privacy Policy</SectionHeading>
          <P className="text-sm text-foreground-muted">Effective date: {EFFECTIVE_DATE}</P>
          <P className="text-sm text-foreground-muted italic">
            This is a working draft prepared for {siteConfig.name}&apos;s launch and has not yet been reviewed by
            counsel. Treat it as a starting point, not a final compliance document, until it has been.
          </P>
        </div>

        <Section title="1. Who we are">
          <P>
            {siteConfig.name} ({siteConfig.description}) is a payment-orchestration platform that lets Kenyan
            businesses (&quot;merchants&quot;, &quot;tenants&quot;) accept M-Pesa payments via Safaricom&apos;s Daraja
            API. This policy explains what personal data we collect from merchants and their customers, why, and
            what rights you have over it.
          </P>
        </Section>

        <Section title="2. Information we collect">
          <P>
            <strong>Account data:</strong> name, email address, password (stored as a salted hash, never in plain
            text), and business details (business name, M-Pesa shortcode) provided when you register or onboard a
            tenant.
          </P>
          <P>
            <strong>Transaction data:</strong> when a payment is initiated, we process the payer&apos;s phone number
            (MSISDN), the payment amount, and the resulting transaction status — this data comes from and is
            settled by Safaricom&apos;s Daraja API; we do not independently collect it from any other source.
          </P>
          <P>
            <strong>Technical data:</strong> IP address, browser/device information, and error diagnostics collected
            automatically via Sentry when something goes wrong. Payment amounts and phone numbers are deliberately
            excluded from what we send to Sentry — see Section 6.
          </P>
        </Section>

        <Section title="3. How we use this information">
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>To create and secure your account, and authenticate your sessions.</li>
            <li>To initiate, process, and reconcile M-Pesa payments on your behalf.</li>
            <li>To detect, investigate, and prevent fraud, abuse, or security incidents.</li>
            <li>To provide support and respond to your requests.</li>
            <li>To meet legal and regulatory obligations, including those under Safaricom&apos;s own merchant terms.</li>
          </ul>
        </Section>

        <Section title="4. Legal basis for processing">
          <P>
            We process personal data under Kenya&apos;s Data Protection Act, 2019, on the bases of: performance of a
            contract (processing a payment you or your customer initiated), legitimate interest (fraud prevention,
            service security), and legal obligation (regulatory recordkeeping).
          </P>
        </Section>

        <Section title="5. Who we share data with">
          <P>
            We do not sell personal data. We share it only where necessary to provide the service:
          </P>
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>
              <strong>Safaricom (Daraja API):</strong> the actual M-Pesa payment processor — every STK Push,
              Paybill, or Till transaction is executed by Safaricom, not by us.
            </li>
            <li>
              <strong>Sentry:</strong> our error-monitoring provider, receiving scrubbed diagnostic data only (see
              Section 6).
            </li>
            <li>
              <strong>Hosting/infrastructure providers</strong> that run our servers and database, bound by their
              own data-processing terms.
            </li>
          </ul>
        </Section>

        <Section title="6. What we deliberately don't share">
          <P>
            Our error-reporting pipeline is built to exclude payment-sensitive data by design: when an API error is
            reported to Sentry, only the error message, HTTP status code, and which form fields failed validation
            are included — phone numbers and payment amounts are never forwarded, even inside validation error
            details.
          </P>
        </Section>

        <Section title="7. Data retention">
          <P>
            We retain account and transaction records for as long as your account is active and for a reasonable
            period afterward to meet accounting, audit, and regulatory obligations. You can request deletion of your
            account data as described in Section 9, subject to records we&apos;re legally required to keep.
          </P>
        </Section>

        <Section title="8. How we protect your data">
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>Session access tokens are held in memory only, never in browser storage.</li>
            <li>Session refresh tokens are stored in httpOnly cookies, inaccessible to page scripts.</li>
            <li>State-changing requests are protected against cross-site request forgery (CSRF).</li>
            <li>Passwords are hashed, never stored or logged in plain text.</li>
            <li>All traffic is encrypted in transit (HTTPS).</li>
          </ul>
        </Section>

        <Section title="9. Your rights">
          <P>
            Under the Data Protection Act, 2019, you have the right to access, correct, or request deletion of your
            personal data, to object to or restrict certain processing, and to lodge a complaint with the Office of
            the Data Protection Commissioner (Kenya). To exercise any of these rights, contact us using the details
            below.
          </P>
        </Section>

        <Section title="10. Cookies">
          <P>
            We use a small number of strictly necessary cookies to keep you signed in: an httpOnly session cookie,
            and a non-httpOnly cookie carrying a CSRF token that our app reads to protect state-changing requests.
            We do not use third-party advertising or tracking cookies.
          </P>
        </Section>

        <Section title="11. Children's privacy">
          <P>{siteConfig.name} is intended for businesses and is not directed at children. We do not knowingly collect personal data from minors.</P>
        </Section>

        <Section title="12. Changes to this policy">
          <P>
            We may update this policy as the service evolves. Material changes will be reflected by updating the
            effective date above; continued use of the service after a change constitutes acceptance of the revised
            policy.
          </P>
        </Section>

        <Section title="13. Contact us">
          <P>
            Questions about this policy or your data can be directed to{" "}
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
