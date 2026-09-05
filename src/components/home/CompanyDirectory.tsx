"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, PenLine, Search, SearchX } from "lucide-react";

import { PagePreview } from "@/components/home/PagePreview";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { readableTextOn } from "@/lib/utils/color";

export interface DirectoryCompany {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  banner_url: string | null;
  logo_url: string | null;
  hero_title: string;
  /** A couple of real role titles, so the thumbnail shows real content. */
  job_titles: string[];
  /** True when the signed-in recruiter owns this company. */
  isOwner: boolean;
}

/**
 * The directory of published careers pages. Filtering is client-side over an already
 * small list; the same pattern as the jobs explorer, and it moves to a query the moment
 * the list outgrows a single page.
 */
export function CompanyDirectory({
  companies,
}: {
  companies: DirectoryCompany[];
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.slug.toLowerCase().includes(term),
    );
  }, [companies, query]);

  return (
    <section id="published-pages" aria-labelledby="directory-heading" className="scroll-mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="directory-heading"
            className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase"
          >
            Live careers portals
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {companies.length} published{" "}
            {companies.length === 1 ? "page" : "pages"} — each rendered from its own row.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="company-filter" className="sr-only">
            Filter companies by name
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400"
            />
            <input
              id="company-filter"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter companies"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-ink-400"
            />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<SearchX aria-hidden="true" className="h-5 w-5" />}
            title="No companies match that filter"
            description="Try a shorter search term, or clear the filter to see every published page."
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((company) => (
            <li key={company.id}>
              <article className="flex h-full gap-4 rounded-xl border border-ink-200 bg-white p-4 transition-shadow hover:shadow-md sm:p-5">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        background: company.primary_color,
                        color: readableTextOn(company.primary_color),
                      }}
                    >
                      {company.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((word) => word[0]?.toUpperCase())
                        .join("")}
                    </span>
                    <h3 className="truncate text-base font-semibold text-ink-900">
                      {company.name}
                    </h3>
                  </div>

                  {company.tagline ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">
                      {company.tagline}
                    </p>
                  ) : null}

                  <p className="mt-2 truncate font-mono text-xs text-ink-400">
                    /{company.slug}/careers
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {/* Only shown to the owner — an Edit button a visitor can't use is a dead end. */}
                    {company.isOwner ? (
                      <Link
                        href={`/${company.slug}/edit`}
                        className={buttonClasses("primary", "sm")}
                      >
                        <PenLine aria-hidden="true" className="h-3.5 w-3.5" />
                        Edit page
                      </Link>
                    ) : null}
                    <Link
                      href={`/${company.slug}/careers`}
                      className={buttonClasses("secondary", "sm")}
                    >
                      View live
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="hidden w-36 shrink-0 self-start sm:block lg:w-40">
                  <PagePreview
                    name={company.name}
                    primaryColor={company.primary_color}
                    secondaryColor={company.secondary_color}
                    bannerUrl={company.banner_url}
                    logoUrl={company.logo_url}
                    heroTitle={company.hero_title}
                    jobTitles={company.job_titles}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
