import { Body, Container, Head, Html, Preview } from "@react-email/components";
import * as React from "react";
import EmailHeader from "./EmailHeader";
import EmailFooter from "./EmailFooter";
import { siteConfig } from "@/config/site";

export const EmailTemplate = ({ children }: { children: React.ReactNode }) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>New Contact from {siteConfig.name}</Preview>
      <Container style={container}>
        <EmailHeader />
        {children}
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 8px 48px",
};
