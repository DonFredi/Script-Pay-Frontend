import { Button, Section, Text } from "@react-email/components";
import { siteConfig } from "@/config/site";
import { EmailTemplate } from "../components/EmailTemplate";
import type { ContactFormValues } from "@/shared/lib/validations/contact-schema";

interface TemplateProps {
  formData: ContactFormValues;
}

export default function ContactEmailTemplate({ formData }: TemplateProps) {
  return (
    <EmailTemplate>
      <Text style={subheading}>New Contact Form Submission from {siteConfig.name} Website</Text>
      <Text style={paragraph}>
        From: <span style={span}>{formData.name}</span>
      </Text>
      <Text style={paragraph}>
        Email: <span style={span}>{formData.email}</span>
      </Text>
      <Text style={paragraph}>Message:</Text>
      <Text style={paragraph}>{formData.message}</Text>
      <Section style={btnContainer}>
        <Button style={button} href={siteConfig.siteUrl}>
          Open Site
        </Button>
      </Section>
    </EmailTemplate>
  );
}

const subheading = {
  fontSize: "18px",
  lineHeight: "26px",
  fontWeight: "700",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const span = {
  fontWeight: "500",
  fontSize: "18px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#0344dc",
  borderRadius: "4px",
  color: "#fff",
  margin: "0 auto",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 32px",
};
