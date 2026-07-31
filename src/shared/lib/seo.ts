import { siteConfig } from "@/config/site";
import { Metadata } from "next";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
};

export function generateSEO({
  title,
  description,
  image,
  url,
  keywords,
}: SEOProps = {}): Metadata {
  const seoTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const seoDescription = description ?? siteConfig.description;
  const seoImage = image ?? siteConfig.ogImage;
  const seoUrl = url ? `${siteConfig.siteUrl}${url}` : siteConfig.siteUrl;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: seoTitle,
    description: seoDescription,
    keywords: keywords ?? [],
    alternates: {
      canonical: url ?? "/",
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: seoUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
