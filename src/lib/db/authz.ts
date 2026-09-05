import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/types";

import { getCompanyBySlug } from "./queries";

export type AuthzResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "forbidden"; userId: string }
  | { status: "ok"; userId: string; company: Company };

/**
 * Single authorization gate for every recruiter route and mutation.
 *
 * Postgres RLS is the real enforcement boundary (a recruiter physically cannot write
 * to another company's rows). This function exists so the UI can render the right
 * screen — sign in vs. 404 vs. "not your company" — instead of surfacing a DB error.
 * Ownership is a single `owner_id` column today; swapping it for a `company_members`
 * join table later only changes this file and the RLS policies.
 */
export async function authorizeCompanyAccess(slug: string): Promise<AuthzResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const company = await getCompanyBySlug(slug);
  if (!company) return { status: "not-found" };

  // Strict: an unowned company is not editable by whoever happens to be signed in.
  if (company.owner_id !== user.id) {
    return { status: "forbidden", userId: user.id };
  }

  return { status: "ok", userId: user.id, company };
}

/** The company a recruiter lands on after signing in. */
export async function getPrimaryCompanyForUser(
  userId: string,
): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, owner_id, name, slug, tagline, logo_url, primary_color, secondary_color, hero_title, hero_description, banner_url, culture_video_url, website_url, location, published, created_at, updated_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Company>();

  return data ?? null;
}
