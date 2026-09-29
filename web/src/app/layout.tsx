import type { Metadata, Viewport } from "next";
import { Fira_Sans_Extra_Condensed, Onest } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { CookieConsent } from "@/components/CookieConsent";
import { MotionRoot } from "@/components/MotionRoot";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const sans = Onest({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-onest" });
// Figures only: odds, chances and scores line up in narrow columns
const figures = Fira_Sans_Extra_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fira" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.tagline} · ${site.name}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, url: site.url, locale: "ru_RU" },
  twitter: { card: "summary_large_image" },
  other: { rating: "adult" },
  appleWebApp: { title: site.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f3f5f0",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg`, email: site.supportEmail },
    { "@type": "WebSite", name: site.name, url: site.url, inLanguage: "ru" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${figures.variable}`}>
      <body className="min-h-dvh">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <AgeGate />
        <CookieConsent />
        <MotionRoot />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
