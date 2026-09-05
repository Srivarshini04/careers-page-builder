import { EyeOff } from "lucide-react";

import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/utils/cn";
import type { CareerSection } from "@/types";

import { sectionAnchor } from "./anchors";

/**
 * One content section. Layout varies by type so a page with four sections doesn't read
 * as four identical text blocks:
 *   about / custom -> two-column editorial (heading left, prose right)
 *   life           -> centred prose + optional media slot
 *   values / benefits -> centred heading + card grid
 */
export function CareerSectionBlock({
  section,
  index,
  media,
  showHiddenMarker = false,
}: {
  section: CareerSection;
  index: number;
  media?: React.ReactNode;
  /** Preview mode renders hidden sections dimmed instead of removing them. */
  showHiddenMarker?: boolean;
}) {
  const anchor = sectionAnchor(section);
  const headingId = `${anchor}-heading`;
  const isGrid = section.section_type === "values" || section.section_type === "benefits";
  const isCentred = isGrid || section.section_type === "life";
  const tinted = index % 2 === 1;
  const hiddenInPreview = showHiddenMarker && !section.is_visible;

  return (
    <section
      id={anchor}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-16 border-b border-ink-100",
        tinted ? "bg-ink-50/70" : "bg-white",
        hiddenInPreview && "relative opacity-55",
      )}
    >
      {hiddenInPreview ? (
        <p className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 pt-4 text-xs font-medium text-ink-500 sm:px-6 lg:px-8">
          <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
          Hidden — candidates won&apos;t see this section
        </p>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {isCentred ? (
          <div className={cn("mx-auto", isGrid ? "max-w-5xl" : "max-w-3xl")}>
            <div className={cn(isGrid ? "text-center" : "")}>
              <SectionEyebrow type={section.section_type} />
              <h2
                id={headingId}
                className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink-900 sm:text-4xl"
              >
                {section.title}
              </h2>
            </div>
            <div className={cn("mt-8", isGrid && "mt-10")}>
              <RichText
                content={section.content}
                listAs={isGrid ? "cards" : "bullets"}
                cardStyle={section.section_type === "benefits" ? "perk" : "principle"}
              />
            </div>
            {media}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionEyebrow type={section.section_type} />
              <h2
                id={headingId}
                className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink-900 sm:text-4xl"
              >
                {section.title}
              </h2>

              {/* Fills the gap a short heading leaves in the narrow column. */}
              {section.image_url ? (
                <div className="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.image_url}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
            {/*
             * The eyebrow sits above the heading in the left column, so without this the
             * prose lines up with "WHO WE ARE" rather than with the heading itself.
             * 1.5rem is the eyebrow's line-height plus the heading's top margin.
             */}
            <div className="lg:mt-6">
              <RichText content={section.content} listAs="bullets" />
              {media}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const EYEBROWS: Record<string, string> = {
  about: "Who we are",
  life: "Inside the team",
  values: "What we believe",
  benefits: "What you get",
  custom: "More about us",
};

function SectionEyebrow({ type }: { type: string }) {
  const label = EYEBROWS[type] ?? EYEBROWS.custom;
  return (
    <p className="text-xs font-semibold tracking-[0.14em] text-(--brand-primary) uppercase">
      {label}
    </p>
  );
}
