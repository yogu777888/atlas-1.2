import type { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { bookmakers } from "@/lib/bookmakers";
import { getMatches } from "@/lib/data";
import { leagues } from "@/lib/leagues";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/matches", "/bookmakers", "/bonuses", "/articles", "/tools", "/responsible-gambling", "/disclosure", "/privacy", "/terms"];
  const matches = await getMatches();
  return [
    ...staticPages.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.7 })),
    ...leagues.map((l) => ({ url: `${site.url}/matches?league=${l.key}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...bookmakers.map((b) => ({ url: `${site.url}/bookmakers/${b.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ url: `${site.url}/articles/${a.slug}`, lastModified: new Date(a.updated), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...tools.map((t) => ({ url: `${site.url}/tools/${t.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...matches.map((m) => ({ url: `${site.url}/matches/${m.id}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
  ];
}
