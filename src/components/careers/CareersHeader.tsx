import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { CareerSection, Company } from "@/types";

import { CompanyLogo } from "./CompanyLogo";
import { sectionAnchor } from "./anchors";

/**
 * Sticky brand header. Section links are desktop-only on purpose: on mobile the one
 * action that matters is getting to the open roles, so that stays a single large tap
 * target instead of a cramped nav that overflows.
 */
export function CareersHeader({
  company,
  sections,
  jobCount,
}: {
  company: Company;
  sections: CareerSection[];
  jobCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-white/85 backdrop-blur-md">
      {/* Tighter gutters below sm so the brand, back link and CTA all fit at 320px. */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/*
           * "Up one level" navigation, so it sits left of the brand rather than among
           * the section links, where it would read as another section. The label
           * collapses to the arrow on small screens to protect the company name.
           */}
          <Link
            href="/"
            aria-label="Browse all companies"
            className="-ml-1.5 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:ml-0 sm:px-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            <span className="hidden md:inline">All companies</span>
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-5 w-px shrink-0 bg-ink-200 sm:block"
          />

          <a
            href="#top"
            className="flex min-w-0 items-center gap-2 rounded-lg sm:gap-3"
            aria-label={`${company.name} careers, back to top`}
          >
            <CompanyLogo company={company} size={36} />
            <span className="truncate text-[15px] font-semibold tracking-tight text-ink-900">
              {company.name}
            </span>
          </a>
        </div>

        <div className="flex items-center gap-1">
          <nav aria-label="Page sections" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {sections.slice(0, 4).map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${sectionAnchor(section)}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#open-roles"
            className="ml-1 inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-(--brand-primary) px-3 text-sm font-semibold whitespace-nowrap text-(--brand-on-primary) transition-opacity hover:opacity-90 sm:px-4"
          >
            Open roles
            <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-xs tabular-nums">
              {jobCount}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
