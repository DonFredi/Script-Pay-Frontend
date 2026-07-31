import { siteConfig } from "@/config/site";
import { Hr, Section, Text } from "@react-email/components";

export default function EmailFooter() {
  return (
    <Section>
      <Text style={paragraph}>
        Best,
        <br />
        {siteConfig.name} team
      </Text>
      <Hr style={hr} />
      <Text style={footer}>{siteConfig.address.location}</Text>
    </Section>
  );
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};
