import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CareersPage } from "@/components/careers/CareersPage";
import { StructuredData } from "@/components/careers/StructuredData";
import { SetupNotice } from "@/components/SetupNotice";
import { getCareersPageData, getCompanyBySlug } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { toPlainText, truncate } from "@/lib/utils/text";
import { getSiteUrl } from "@/lib/utils/url";

/**
 * The public candidate page. Fully server-rendered so the company story and every job
 * are in the initial HTML for crawlers; filtering then happens client-side.
 */

interface PageProps {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ q?: string; location?: string; type?: string }>;
}

/*
 * Rendered per request. The Supabase client reads auth cookies (so an owner can see
 * their own unpublished page), which makes the route dynamic. Adding ISR/edge caching
 * for anonymous traffic is the first scaling step — see Tech Spec §Scalability.
 *
 * Deliberately no `loading.tsx` on this route. A loading file wraps the page in a
 * Suspense boundary, so Next streams the shell — and a 200 status — before this
 * component can call notFound(). That turns an unknown slug into a soft 404 that
 * search engines will happily index. Correct status codes matter more here than a
 * skeleton on a page that is one indexed lookup plus two parallel queries.
 */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Setup required" };

  const { companySlug } = await params;
  const company = await getCompanyBySlug(companySlug);

  if (!company || !company.published) {
    return { title: "Careers page not found", robots: { index: false } };
  }

  const siteUrl = await getSiteUrl();
  const url = `${siteUrl}/${company.slug}/careers`;
  const title = `Careers at ${company.name}`;
  const description = truncate(
    toPlainText(company.hero_description) ||
      company.tagline ||
      `Explore open roles at ${company.name}.`,
    160,
  );

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: company.name,
      ...(company.banner_url ? { images: [{ url: company.banner_url }] } : {}),
    },
    twitter: {
      card: company.banner_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(company.banner_url ? { images: [company.banner_url] } : {}),
    },
  };
}

export default async function PublicCareersPage({
  params,
  searchParams,
}: PageProps) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { companySlug } = await params;
  const data = await getCareersPageData(companySlug);

  // Unpublished pages are not reachable publicly — the recruiter previews them instead.
  if (!data || !data.company.published) notFound();

  const { q, location, type } = await searchParams;
  const siteUrl = await getSiteUrl();

  return (
    <>
      <StructuredData
        company={data.company}
        sections={data.sections}
        jobs={data.jobs}
        pageUrl={`${siteUrl}/${data.company.slug}/careers`}
      />
      <CareersPage
        data={data}
        mode="live"
        initialFilters={{ query: q ?? "", location: location ?? "", jobType: type ?? "" }}
      />
    </>
  );
}
