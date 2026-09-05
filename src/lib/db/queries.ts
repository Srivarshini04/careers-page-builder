import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CareerSection, CareersPageData, Company, Job } from "@/types";

/**
 * All reads are scoped by company (slug -> id -> children), so adding companies never
 * widens a query. Column lists are explicit to avoid shipping columns the page never uses.
 */

const COMPANY_COLUMNS =
  "id, owner_id, name, slug, tagline, logo_url, primary_color, secondary_color, hero_title, hero_description, banner_url, culture_video_url, website_url, location, published, created_at, updated_at";

const SECTION_COLUMNS =
  "id, company_id, section_type, title, content, display_order, is_visible, created_at, updated_at";

const JOB_COLUMNS =
  "id, company_id, title, location, job_type, department, description, is_published, created_at, updated_at";

export class DataAccessError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "DataAccessError";
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<Company>();

  if (error) throw new DataAccessError("Could not load this company.", error);
  return data ?? null;
}

export async function getSections(
  companyId: string,
  { visibleOnly }: { visibleOnly: boolean },
): Promise<CareerSection[]> {
  const supabase = await createClient();
  let query = supabase
    .from("career_sections")
    .select(SECTION_COLUMNS)
    .eq("company_id", companyId)
    .order("display_order", { ascending: true });

  if (visibleOnly) query = query.eq("is_visible", true);

  const { data, error } = await query.returns<CareerSection[]>();
  if (error) throw new DataAccessError("Could not load page sections.", error);
  return data ?? [];
}

export async function getJobs(
  companyId: string,
  { publishedOnly }: { publishedOnly: boolean },
): Promise<Job[]> {
  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select(JOB_COLUMNS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query.returns<Job[]>();
  if (error) throw new DataAccessError("Could not load open positions.", error);
  return data ?? [];
}

/**
 * One entry point for both `/[slug]/careers` and `/[slug]/preview` so the two routes
 * can never drift apart. Preview passes `draft: true` to see hidden sections too.
 */
export async function getCareersPageData(
  slug: string,
  { draft = false }: { draft?: boolean } = {},
): Promise<CareersPageData | null> {
  const company = await getCompanyBySlug(slug);
  if (!company) return null;

  const [sections, jobs] = await Promise.all([
    getSections(company.id, { visibleOnly: !draft }),
    getJobs(company.id, { publishedOnly: true }),
  ]);

  return { company, sections, jobs };
}

/** Slugs for `generateStaticParams` / sitemap. Cheap: one indexed column. */
export async function getPublishedCompanySlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("slug")
    .eq("published", true)
    .returns<{ slug: string }[]>();

  if (error) return [];
  return (data ?? []).map((row) => row.slug);
}
