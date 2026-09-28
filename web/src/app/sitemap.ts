import type { MetadataRoute } from "next";
import { bookmakers } from "@/lib/bookmakers";
import { getEvents } from "@/lib/odds/provider";
import { site } from "@/lib/site";
import { sports } from "@/lib/sports";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/odds", "/bookmakers", "/bonuses", "/responsible-gambling", "/disclosure", "/privacy", "/terms"];
  const events = await getEvents();
  return [
    ...staticPages.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.7 })),
    ...sports.map((s) => ({ url: `${site.url}/odds?sport=${s.key}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...bookmakers.map((b) => ({ url: `${site.url}/bookmakers/${b.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...events.map((e) => ({ url: `${site.url}/odds/${e.id}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
  ];
}
