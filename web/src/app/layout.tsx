import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { CookieConsent } from "@/components/CookieConsent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — сравнение коэффициентов букмекеров`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, url: site.url, locale: "ru_RU" },
  twitter: { card: "summary_large_image" },
  other: { rating: "adult" },
  alternates: { canonical: "/" },
  appleWebApp: { title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
    { "@type": "WebSite", name: site.name, url: site.url },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <AgeGate />
        <CookieConsent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
