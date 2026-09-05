/** Domain types. These mirror the Postgres schema in `supabase/schema.sql`. */

export const SECTION_TYPES = [
  "about",
  "life",
  "values",
  "benefits",
  "custom",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export interface Company {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_description: string | null;
  banner_url: string | null;
  culture_video_url: string | null;
  website_url: string | null;
  location: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerSection {
  id: string;
  company_id: string;
  section_type: SectionType;
  title: string;
  content: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  location: string;
  job_type: string;
  department: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Everything the careers page renderer needs, for both preview and public routes. */
export interface CareersPageData {
  company: Company;
  sections: CareerSection[];
  jobs: Job[];
}

/** The subset of company fields a recruiter may edit in the builder. */
export type CompanyDraft = Pick<
  Company,
  | "name"
  | "tagline"
  | "logo_url"
  | "primary_color"
  | "secondary_color"
  | "hero_title"
  | "hero_description"
  | "banner_url"
  | "culture_video_url"
  | "website_url"
  | "location"
  | "published"
>;

/** The subset of section fields a recruiter may edit in the builder. */
export interface SectionDraft {
  id: string;
  section_type: SectionType;
  title: string;
  content: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  /** Client-only marker for sections created in the browser and not yet persisted. */
  isNew?: boolean;
}
