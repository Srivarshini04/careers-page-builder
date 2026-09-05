"use server";

import { revalidatePath } from "next/cache";

import { authorizeCompanyAccess } from "@/lib/db/authz";
import { validateCompanyDraft, validateSections } from "@/lib/db/validation";
import { createClient } from "@/lib/supabase/server";
import type { CompanyDraft, SectionDraft } from "@/types";

export interface SaveResult {
  ok: boolean;
  message: string;
  errors?: string[];
  savedAt?: string;
}

/**
 * The single write path for the builder.
 *
 * Defence in depth, outermost first:
 *   1. middleware — anonymous users never reach the editor route
 *   2. authorizeCompanyAccess — this recruiter owns this slug
 *   3. validation — shape, length and URL/colour sanity
 *   4. Postgres RLS — the update physically cannot touch another company's rows
 *
 * `company_id` is taken from the authorized company, never from the client payload,
 * so a tampered request can't retarget another tenant.
 */
export async function saveCareersPage(
  slug: string,
  companyDraft: Partial<CompanyDraft>,
  sectionDrafts: SectionDraft[],
): Promise<SaveResult> {
  const access = await authorizeCompanyAccess(slug);

  if (access.status === "unauthenticated") {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }
  if (access.status === "not-found") {
    return { ok: false, message: "That company no longer exists." };
  }
  if (access.status === "forbidden") {
    return { ok: false, message: "You don't have access to this company." };
  }

  const company = access.company;
  const companyResult = validateCompanyDraft(companyDraft);
  const sectionsResult = validateSections(sectionDrafts);

  if (!companyResult.ok || !sectionsResult.ok) {
    return {
      ok: false,
      message: "Please fix the highlighted fields and try again.",
      errors: [...companyResult.errors, ...sectionsResult.errors],
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error: companyError } = await supabase
    .from("companies")
    .update({ ...companyResult.value, updated_at: now })
    .eq("id", company.id);

  if (companyError) {
    return { ok: false, message: describe(companyError.message) };
  }

  // Remove sections the recruiter deleted. The set difference is computed here rather
  // than with a `not.in` filter so the delete is always a plain, explicit id list.
  const keptIds = new Set(sectionsResult.value.map((section) => section.id));

  const { data: existing, error: existingError } = await supabase
    .from("career_sections")
    .select("id")
    .eq("company_id", company.id)
    .returns<{ id: string }[]>();

  if (existingError) {
    return { ok: false, message: describe(existingError.message) };
  }

  const removedIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !keptIds.has(id));

  if (removedIds.length) {
    const { error: deleteError } = await supabase
      .from("career_sections")
      .delete()
      .eq("company_id", company.id)
      .in("id", removedIds);

    if (deleteError) {
      return { ok: false, message: describe(deleteError.message) };
    }
  }

  if (sectionsResult.value.length) {
    const { error: upsertError } = await supabase.from("career_sections").upsert(
      sectionsResult.value.map((section) => ({
        ...section,
        company_id: company.id,
        updated_at: now,
      })),
      { onConflict: "id" },
    );

    if (upsertError) {
      return { ok: false, message: describe(upsertError.message) };
    }
  }

  revalidatePath(`/${company.slug}/careers`);
  revalidatePath(`/${company.slug}/preview`);
  revalidatePath(`/${company.slug}/edit`);

  return { ok: true, message: "Saved", savedAt: now };
}

function describe(dbMessage: string): string {
  if (/row-level security/i.test(dbMessage)) {
    return "You don't have permission to change this company's page.";
  }
  if (/duplicate key/i.test(dbMessage)) {
    return "That value is already taken. Try a different one.";
  }
  return "We couldn't save your changes. Please try again.";
}
