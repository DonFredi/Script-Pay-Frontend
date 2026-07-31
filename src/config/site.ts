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

export const siteConfig: SiteConfig = {
  name: "Script Pay",
  description: "Online M-Pesa payments for businesses",
  siteUrl: clientConfig.app.siteUrl || "http://localhost:3000",
  contact: {
    phone: {
      label: "+254 797 162 262",
      link: "tel:+254797162262",
    },
    email: {
      label: "scripttagg@gmail.com",
      link: "mailto:scripttagg@gmail.com",
    },
    whatsapp: {
      label: "+254 797 162 262",
      link: "https://wa.me/254797162262",
    },
  },
  address: {
    location: "Obama Estate",
  },
  ogImage: "",
  socialLinks: {
    twitter: "https://x.com/scripttagg",
    pinterest: "https://pinterest.com/scripttagg",
    instagram: "https://instagram.com/scripttagg",
    tiktok: "https://www.tiktok.com/@scripttagg",
    github: "https://www.github.com/scripttagg",
  },
};
