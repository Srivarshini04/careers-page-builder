/**
 * Demo recruiter credentials for the hosted prototype.
 *
 * Two accounts, one per company, on purpose: with a single owner the tenant-isolation
 * story is untestable, because that account legitimately owns everything. Signing in as
 * one recruiter and opening the other company's builder is genuinely blocked by RLS.
 *
 * These are intentionally public — they are printed on the login screen — and are only
 * used to prefill the form. The real check happens in Supabase Auth.
 */

export interface DemoAccount {
  email: string;
  password: string;
  company: string;
  slug: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@careerbuilder.dev",
    password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo-recruiter-2024",
    company: "Northwind Labs",
    slug: "northwind-labs",
  },
  {
    email: process.env.NEXT_PUBLIC_DEMO_EMAIL_2 ?? "lumen@careerbuilder.dev",
    password: process.env.NEXT_PUBLIC_DEMO_PASSWORD_2 ?? "demo-recruiter-2024",
    company: "Lumen Health",
    slug: "lumen-health",
  },
];

export const DEMO_EMAIL = DEMO_ACCOUNTS[0].email;
export const DEMO_PASSWORD = DEMO_ACCOUNTS[0].password;
