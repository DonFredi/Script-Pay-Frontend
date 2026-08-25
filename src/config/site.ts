import { clientConfig } from "./client";

interface SiteConfig {
  name: string;
  description: string;
  siteUrl: string;
  contact: {
    phone: {
      label: string;
      link: string;
    };
    email: {
      label: string;
      link: string;
    };
    whatsapp: {
      label: string;
      link: string;
    };
  };
  address: {
    location: string;
  };
  ogImage: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    pinterest: string;
    tiktok: string;
    github: string;
  };
}

const { branding } = clientConfig;

export const siteConfig: SiteConfig = {
  name: branding.name,
  description: branding.description,
  siteUrl: clientConfig.app.siteUrl || "http://localhost:3000",
  contact: {
    phone: {
      label: branding.contactPhone,
      link: `tel:${branding.contactPhone.replace(/\s+/g, "")}`,
    },
    email: {
      label: branding.contactEmail,
      link: `mailto:${branding.contactEmail}`,
    },
    whatsapp: {
      label: branding.contactWhatsapp,
      link: `https://wa.me/${branding.contactWhatsapp.replace(/\D/g, "")}`,
    },
  },
  address: {
    location: branding.address,
  },
  ogImage: branding.ogImage,
  socialLinks: branding.social,
};
