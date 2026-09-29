import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/**
 * Old English paths moved to Russian transliteration in September 2026. 301,
 * not 308: Yandex has handled 301 the longest. /matches is redirected in
 * app/matches because its league filter lives in the query string.
 */
const moved: [string, string][] = [
  ["/bookmakers", "/bukmekery"],
  ["/bookmakers/:slug", "/bukmekery/:slug"],
  ["/bonuses", "/bonusy"],
  ["/articles", "/stati"],
  ["/articles/:slug", "/stati/:slug"],
  ["/tools", "/kalkulyatory"],
  ["/tools/:slug", "/kalkulyatory/:slug"],
  ["/methodology", "/metodika"],
  ["/about", "/o-redakcii"],
  ["/responsible-gambling", "/otvetstvennaya-igra"],
  ["/disclosure", "/reklama"],
  ["/privacy", "/konfidencialnost"],
  ["/terms", "/usloviya"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return moved.map(([source, destination]) => ({ source, destination, statusCode: 301 }));
  },
};

export default nextConfig;
