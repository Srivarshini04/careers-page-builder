import { headers } from "next/headers";

/**
 * Absolute origin for canonical URLs, Open Graph tags and JSON-LD.
 * Order: explicit config -> Vercel's deployment URL -> the incoming request host.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  try {
    const headerList = await headers();
    const host = headerList.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  } catch {
    // No request context (e.g. build-time metadata generation).
    return "http://localhost:3000";
  }
}
