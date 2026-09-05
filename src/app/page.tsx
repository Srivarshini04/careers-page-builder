import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  LayoutTemplate,
  Palette,
  SearchCheck,
  Smartphone,
} from "lucide-react";

import { SetupNotice } from "@/components/SetupNotice";
import { buttonClasses } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Careers Page Builder",
  description:
    "A small ATS module: recruiters build a branded careers page, candidates browse and filter open roles.",
};

// Reads live company rows, so never serve a build-time snapshot.
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Palette,
    title: "Brand it in minutes",
    body: "Colours, logo, banner and culture video — the page restyles itself as you type.",
  },
  {
    icon: LayoutTemplate,
    title: "Sections you control",
    body: "Add, rename, reorder or hide About us, Values, Benefits and anything else.",
  },
  {
    icon: Smartphone,
    title: "Built mobile-first",
    body: "Candidates search and filter roles comfortably on a phone, keyboard or screen reader.",
  },
  {
    icon: SearchCheck,
    title: "SEO ready",
    body: "Server-rendered HTML with meta tags plus Organization and JobPosting structured data.",
  },
];

export default async function HomePage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, tagline, primary_color")
    .eq("published", true)
    .order("created_at", { ascending: true })
    .limit(6);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-tight text-ink-900">
            Careers Page Builder
          </p>
          <Link href="/login" className={buttonClasses("secondary", "sm")}>
            Recruiter sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-ink-200 bg-ink-50/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                Whitecarrot assignment
              </p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-ink-900 sm:text-5xl">
                Careers pages that look like the company, not like the ATS.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-ink-600">
                Recruiters customise their branding, story and sections in a live
                builder. Candidates get a fast, accessible page where they can search
                and filter every open role.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/login" className={buttonClasses("primary", "lg")}>
                  Open the builder
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                {companies?.[0] ? (
                  <Link
                    href={`/${companies[0].slug}/careers`}
                    className={buttonClasses("secondary", "lg")}
                  >
                    See a live careers page
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <h2 id="features-heading" className="sr-only">
            What the product does
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-xl border border-ink-200 bg-white p-5"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-700">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {companies && companies.length > 0 ? (
          <section
            aria-labelledby="companies-heading"
            className="border-t border-ink-200 bg-ink-50/60"
          >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
              <h2
                id="companies-heading"
                className="text-2xl font-semibold tracking-tight text-ink-900"
              >
                Published careers pages
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                Every page below is rendered from its own row in the database — same
                code, different tenant.
              </p>
              <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => (
                  <li key={company.id}>
                    <Link
                      href={`/${company.slug}/careers`}
                      className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-md"
                    >
                      <span
                        aria-hidden="true"
                        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-white"
                        style={{ background: company.primary_color }}
                      >
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="text-base font-semibold text-ink-900">
                        {company.name}
                      </span>
                      {company.tagline ? (
                        <span className="mt-1 text-sm text-ink-600">
                          {company.tagline}
                        </span>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-ink-500 group-hover:text-ink-800">
                        /{company.slug}/careers
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-ink-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-ink-500 sm:px-6 lg:px-8">
          <p>Careers Page Builder — Next.js, Supabase, Tailwind.</p>
          <Link href="/login" className="underline-offset-4 hover:underline">
            Recruiter sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
