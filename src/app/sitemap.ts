import type { MetadataRoute } from "next";

import { getPublishedCompanySlugs } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/utils/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const slugs = isSupabaseConfigured() ? await getPublishedCompanySlugs() : [];

  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 0.5 },
    ...slugs.map((slug) => ({
      url: `${siteUrl}/${slug}/careers`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
