import type { Metadata } from "next";
import { Poppins, Sofia_Sans } from "next/font/google";
import "@/styles/globals.css";
import { generateSEO } from "@/shared/lib/seo";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sofiaSans = Sofia_Sans({
  variable: "--font-sofia-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = generateSEO();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-screen" data-scroll-behavior="smooth">
      <body className={`${poppins.variable} ${sofiaSans.variable} antialiased min-h-screen gap-y-10 flex flex-col`}>
        {/* Organization */}
        {/* <JsonLd data={organizationSchema} /> */}
        {/* Website */}
        {/* <JsonLd data={websiteSchema} /> */}
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
