import { slugify } from "@/lib/utils/text";
import type { CareerSection } from "@/types";

/** Stable, human-readable anchor for in-page navigation and shareable deep links. */
export function sectionAnchor(section: Pick<CareerSection, "id" | "title">): string {
  return slugify(section.title) || `section-${section.id.slice(0, 8)}`;
}
