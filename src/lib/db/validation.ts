import { isValidHex, normalizeHex, DEFAULT_PRIMARY, DEFAULT_SECONDARY } from "@/lib/utils/color";
import { SECTION_TYPES, type CompanyDraft, type SectionDraft, type SectionType } from "@/types";

/**
 * Server-side validation for the builder payload.
 *
 * The browser also validates, but nothing client-side is trusted: this runs inside the
 * Server Action before anything touches Postgres. Deliberately hand-written rather than
 * pulling in a schema library — the surface is one form.
 */

export interface ValidationResult<T> {
  ok: boolean;
  value: T;
  errors: string[];
}

const MAX = {
  name: 80,
  tagline: 140,
  heroTitle: 120,
  heroDescription: 400,
  url: 500,
  sectionTitle: 60,
  sectionContent: 4000,
  location: 120,
};

function trimOrNull(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateCompanyDraft(
  input: Partial<CompanyDraft>,
): ValidationResult<CompanyDraft> {
  const errors: string[] = [];

  const name = trimOrNull(input.name, MAX.name);
  if (!name) errors.push("Company name is required.");

  const heroTitle = trimOrNull(input.hero_title, MAX.heroTitle);
  if (!heroTitle) errors.push("Hero title is required.");

  for (const [label, key] of [
    ["Logo URL", "logo_url"],
    ["Banner image URL", "banner_url"],
    ["Culture video URL", "culture_video_url"],
    ["Website URL", "website_url"],
  ] as const) {
    const value = trimOrNull(input[key], MAX.url);
    if (value && !isSafeUrl(value)) errors.push(`${label} must be a valid http(s) URL.`);
  }

  if (input.primary_color && !isValidHex(input.primary_color)) {
    errors.push("Primary colour must be a hex value like #4f46e5.");
  }
  if (input.secondary_color && !isValidHex(input.secondary_color)) {
    errors.push("Secondary colour must be a hex value like #0f172a.");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      name: name ?? "",
      tagline: trimOrNull(input.tagline, MAX.tagline),
      logo_url: trimOrNull(input.logo_url, MAX.url),
      banner_url: trimOrNull(input.banner_url, MAX.url),
      culture_video_url: trimOrNull(input.culture_video_url, MAX.url),
      website_url: trimOrNull(input.website_url, MAX.url),
      location: trimOrNull(input.location, MAX.location),
      primary_color: normalizeHex(input.primary_color ?? "", DEFAULT_PRIMARY),
      secondary_color: normalizeHex(input.secondary_color ?? "", DEFAULT_SECONDARY),
      hero_title: heroTitle ?? "",
      hero_description: trimOrNull(input.hero_description, MAX.heroDescription),
      published: Boolean(input.published),
    },
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateSections(
  input: unknown,
): ValidationResult<Omit<SectionDraft, "isNew">[]> {
  const errors: string[] = [];
  const rows = Array.isArray(input) ? input : [];

  const value = rows.map((raw, index) => {
    const row = (raw ?? {}) as Partial<SectionDraft>;
    const title = trimOrNull(row.title, MAX.sectionTitle);
    if (!title) errors.push(`Section ${index + 1} needs a title.`);
    if (!row.id || !UUID.test(String(row.id))) {
      errors.push(`Section ${index + 1} has an invalid id.`);
    }

    const sectionType = SECTION_TYPES.includes(row.section_type as SectionType)
      ? (row.section_type as SectionType)
      : "custom";

    return {
      id: String(row.id ?? ""),
      section_type: sectionType,
      title: title ?? "",
      content: typeof row.content === "string" ? row.content.slice(0, MAX.sectionContent) : "",
      // Order is re-derived from array position: the client can't send a broken sequence.
      display_order: index,
      is_visible: row.is_visible !== false,
    };
  });

  if (value.length > 12) errors.push("A careers page can have at most 12 sections.");

  return { ok: errors.length === 0, errors, value };
}
