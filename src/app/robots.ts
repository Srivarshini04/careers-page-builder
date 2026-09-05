import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/utils/url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Recruiter surfaces are private and must never appear in search results.
        disallow: ["/login", "/go", "/preview-frame", "/*/edit", "/*/preview"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
