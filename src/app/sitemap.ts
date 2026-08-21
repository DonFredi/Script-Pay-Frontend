import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

const baseUrl = siteConfig.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
   
  ];
}
