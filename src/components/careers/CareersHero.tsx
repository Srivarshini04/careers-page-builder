import { ArrowRight, MapPin } from "lucide-react";

import { normalizeHex, rgba } from "@/lib/utils/color";
import { DEFAULT_SECONDARY } from "@/lib/utils/color";
import type { Company } from "@/types";

/**
 * Two hero treatments driven by whether the recruiter set a banner:
 *  - banner set  -> photo with a brand-tinted scrim so text stays legible on any image
 *  - no banner   -> layered brand gradient, so an unconfigured page still looks intentional
 */
export function CareersHero({
  company,
  jobCount,
}: {
  company: Company;
  jobCount: number;
}) {
  const secondary = normalizeHex(company.secondary_color, DEFAULT_SECONDARY);
  const hasBanner = Boolean(company.banner_url);

  return (
    <section
      id="top"
      /*
       * Scoped id: the builder renders this hero *inside* the same document as its own
       * "Hero title" form field, so a bare `hero-title` id would be duplicated and the
       * <label for> association would become ambiguous.
       */
      aria-labelledby="careers-hero-heading"
      className="relative isolate overflow-hidden"
      style={{ background: secondary }}
    >
      {hasBanner ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={company.banner_url ?? ""}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background: `linear-gradient(100deg, ${rgba(secondary, 0.94)} 0%, ${rgba(secondary, 0.82)} 45%, ${rgba(secondary, 0.55)} 100%)`,
            }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 480px at 8% 0%, var(--brand-primary-soft), transparent 65%), radial-gradient(800px 400px at 95% 100%, var(--brand-primary-soft), transparent 60%)",
          }}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <p
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
            style={{
              background: "var(--brand-primary)",
              color: "var(--brand-on-primary)",
            }}
          >
            Careers at {company.name}
          </p>

          <h1
            id="careers-hero-heading"
            className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            style={{ color: "var(--brand-on-secondary)" }}
          >
            {company.hero_title}
          </h1>

          {company.hero_description ? (
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed opacity-90 sm:text-xl"
              style={{ color: "var(--brand-on-secondary)" }}
            >
              {company.hero_description}
            </p>
          ) : null}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#open-roles"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-(--brand-primary) px-6 text-base font-semibold text-(--brand-on-primary) transition-opacity hover:opacity-90"
            >
              {jobCount > 0
                ? `View ${jobCount} open ${jobCount === 1 ? "role" : "roles"}`
                : "View open roles"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>

            {company.location ? (
              <p
                className="inline-flex items-center gap-1.5 text-sm opacity-80 sm:ml-2"
                style={{ color: "var(--brand-on-secondary)" }}
              >
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {company.location}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
