/**
 * Demo recruiter credentials for the hosted prototype. They are intentionally public
 * (they are printed on the login screen) and are only ever used to prefill the form —
 * the actual check happens in Supabase Auth against the seeded user.
 */
export const DEMO_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@careerbuilder.dev";

export const DEMO_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo-recruiter-2024";

export const DEMO_COMPANY_SLUG =
  process.env.NEXT_PUBLIC_DEMO_COMPANY_SLUG ?? "northwind-labs";
