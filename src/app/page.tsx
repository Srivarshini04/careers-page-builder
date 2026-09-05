import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";

import { CompanyDirectory, type DirectoryCompany } from "@/components/home/CompanyDirectory";
import { BrandArt, RolesArt, TalentArt } from "@/components/home/FeatureArt";
import { SetupNotice } from "@/components/SetupNotice";
import { buttonClasses } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Careers Page Builder",
  description:
    "A small ATS module: recruiters build a branded careers page, candidates browse and filter open roles.",
};

// Reads live company rows and the current session.
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    art: BrandArt,
    label: "Brand your page",
    body: "Customise colours, logo, banner and culture story — the page restyles as you type.",
    card: "bg-indigo-50/70 border-indigo-100",
    art_tone: "text-indigo-500",
    heading: "text-indigo-950",
    body_tone: "text-indigo-900/70",
  },
  {
    art: RolesArt,
    label: "Manage open roles",
    body: "Add, order and publish positions; candidates filter them by location and type.",
    card: "bg-emerald-50/70 border-emerald-100",
    art_tone: "text-emerald-500",
    heading: "text-emerald-950",
    body_tone: "text-emerald-900/70",
  },
  {
    art: TalentArt,
    label: "Engage talent",
    body: "A seamless, accessible candidate experience that search engines can read.",
    card: "bg-sky-50/70 border-sky-100",
    art_tone: "text-sky-500",
    heading: "text-sky-950",
    body_tone: "text-sky-900/70",
  },
];

export default async function HomePage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();

  const [{ data: companies }, { data: jobs }, { data: auth }] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, name, slug, tagline, primary_color, secondary_color, banner_url, logo_url, hero_title, owner_id",
      )
      .eq("published", true)
      // Tiebreak on slug: `now()` is transaction time, so companies seeded together
      // share a created_at and the order would otherwise be whatever the planner returns.
      .order("created_at", { ascending: true })
      .order("slug", { ascending: true })
      .limit(12)
      .returns<(DirectoryCompany & { owner_id: string | null })[]>(),
    // Titles for the card thumbnails. RLS already limits this to published rows.
    supabase
      .from("jobs")
      .select("company_id, title")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .returns<{ company_id: string; title: string }[]>(),
    supabase.auth.getUser(),
  ]);

  const titlesByCompany = new Map<string, string[]>();
  for (const job of jobs ?? []) {
    const existing = titlesByCompany.get(job.company_id) ?? [];
    if (existing.length < 4) {
      titlesByCompany.set(job.company_id, [...existing, job.title]);
    }
  }

  const userId = auth?.user?.id ?? null;
  const directory: DirectoryCompany[] = (companies ?? []).map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    tagline: company.tagline,
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
    banner_url: company.banner_url,
    logo_url: company.logo_url,
    hero_title: company.hero_title,
    job_titles: titlesByCompany.get(company.id) ?? [],
    isOwner: Boolean(userId) && company.owner_id === userId,
  }));

  const signedIn = Boolean(userId);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
              <Layers aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink-900">
              Careers Page Builder
            </span>
          </Link>

          {/* Only real destinations here — a nav item that goes nowhere is worse than none. */}
          {signedIn ? (
            <Link href="/go" className={buttonClasses("primary", "sm")}>
              Open my builder
            </Link>
          ) : (
            <Link href="/login" className={buttonClasses("secondary", "sm")}>
              Recruiter sign in
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <section className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
              Careers Page Builder
            </p>
            <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-ink-900 sm:text-5xl">
              Careers pages that capture your brand, not the ATS.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              Recruiters customise their branding, story and sections in a live builder.
              Candidates get a fast, accessible page where they can search and filter
              every open role.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={signedIn ? "/go" : "/login"}
                className={buttonClasses("primary", "lg")}
              >
                {signedIn ? "Open my builder" : "Recruiter sign in"}
              </Link>
              {directory.length > 0 ? (
                // Jumps to the directory instead of picking a company for the visitor.
                <a href="#published-pages" className={buttonClasses("secondary", "lg")}>
                  Browse published pages
                </a>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="features-heading" className="mt-14 sm:mt-16">
            <h2 id="features-heading" className="sr-only">
              What the product does
            </h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature) => {
                const Art = feature.art;
                return (
                  <li
                    key={feature.label}
                    className={`relative overflow-hidden rounded-xl border p-5 ${feature.card}`}
                  >
                    <Art
                      className={`pointer-events-none absolute -top-1 right-2 h-16 w-24 ${feature.art_tone}`}
                    />
                    <div className="relative pt-12">
                      <h3
                        className={`text-xs font-semibold tracking-widest uppercase ${feature.heading}`}
                      >
                        {feature.label}
                      </h3>
                      <p className={`mt-2 text-sm leading-relaxed ${feature.body_tone}`}>
                        {feature.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mt-14 sm:mt-16">
            <CompanyDirectory companies={directory} />
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Careers Page Builder</p>
          {/*
           * No sitemap link here. /sitemap.xml still exists and robots.txt points
           * crawlers at it, but it is a machine-readable file — sending a person to raw
           * XML is a dead end, not a feature.
           */}
          <Link href="/login" className="underline-offset-4 hover:underline">
            Recruiter sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
