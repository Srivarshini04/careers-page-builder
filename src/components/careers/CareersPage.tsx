import { JobsExplorer } from "@/components/jobs/JobsExplorer";
import type { JobFilterState } from "@/components/jobs/JobFilters";
import { brandStyle } from "@/lib/utils/color";
import type { CareersPageData } from "@/types";

import { CareerSectionBlock } from "./CareerSectionBlock";
import { CareersFooter } from "./CareersFooter";
import { CareersHeader } from "./CareersHeader";
import { CareersHero } from "./CareersHero";
import { CultureVideo } from "./CultureVideo";

/**
 * THE careers page. `/[slug]/careers`, `/[slug]/preview` and the builder's live pane all
 * render this exact component — the only difference is where the data comes from and
 * whether hidden sections are dimmed instead of dropped. There is deliberately no second
 * implementation to keep in sync.
 *
 * Note it is a plain (non-async, non-server-only) component so the client-side builder
 * can re-render it from local draft state on every keystroke.
 */
export function CareersPage({
  data,
  initialFilters,
}: {
  data: CareersPageData;
  initialFilters?: Partial<JobFilterState>;
}) {
  const { company, sections, jobs } = data;

  /*
   * Hidden sections are dropped everywhere, including the builder's live pane and the
   * preview route. They used to render dimmed with a "candidates won't see this" label,
   * which meant the preview showed something no visitor ever gets. The structure panel
   * already lists hidden sections and marks them, so nothing is lost by making the
   * preview show exactly the published result.
   */
  const renderedSections = sections.filter((section) => section.is_visible);

  // The culture video belongs with "Life at ..." when that section exists; otherwise it
  // gets its own block so setting the URL always has a visible effect.
  const lifeSection = renderedSections.find((s) => s.section_type === "life");

  return (
    <div
      style={brandStyle(company.primary_color, company.secondary_color)}
      className="min-h-screen bg-white"
    >
      <a
        href="#open-roles"
        className="sr-only rounded-lg bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to open roles
      </a>

      <CareersHeader company={company} sections={renderedSections} jobCount={jobs.length} />

      <main>
        <CareersHero company={company} jobCount={jobs.length} />

        {renderedSections.map((section, index) => (
          <CareerSectionBlock
            key={section.id}
            section={section}
            index={index}
            media={
              section.id === lifeSection?.id ? (
                <CultureVideo
                  url={company.culture_video_url}
                  companyName={company.name}
                />
              ) : undefined
            }
          />
        ))}

        {!lifeSection && company.culture_video_url ? (
          <section
            aria-labelledby="culture-heading"
            className="scroll-mt-16 border-b border-ink-100 bg-white"
            id="culture"
          >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-semibold tracking-[0.14em] text-(--brand-primary) uppercase">
                  Inside the team
                </p>
                <h2
                  id="culture-heading"
                  className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
                >
                  Life at {company.name}
                </h2>
                <CultureVideo
                  url={company.culture_video_url}
                  companyName={company.name}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section
          id="open-roles"
          aria-labelledby="open-roles-heading"
          className="scroll-mt-16 bg-ink-50/70"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-(--brand-primary) uppercase">
                Join us
              </p>
              <h2
                id="open-roles-heading"
                className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
              >
                Open positions
              </h2>
              <p className="mt-3 text-base text-ink-600 sm:text-lg">
                Search by title, or filter by location and job type to find your fit.
              </p>
            </div>

            <div className="mt-8">
              <JobsExplorer jobs={jobs} initialFilters={initialFilters} />
            </div>
          </div>
        </section>
      </main>

      <CareersFooter company={company} />
    </div>
  );
}
