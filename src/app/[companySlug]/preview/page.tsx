import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye, Globe, Lock } from "lucide-react";

import { CareersPage } from "@/components/careers/CareersPage";
import { NoAccess } from "@/components/NoAccess";
import { SetupNotice } from "@/components/SetupNotice";
import { buttonClasses } from "@/components/ui/Button";
import { authorizeCompanyAccess } from "@/lib/db/authz";
import { getJobs, getSections } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Preview careers page",
  // A preview can show unpublished content, so it must never be indexed.
  robots: { index: false, follow: false },
};

/**
 * Recruiter-only, full-page preview of the *saved* state, rendered exactly as candidates
 * receive it — hidden sections are omitted here too, and the toolbar reports how many.
 * It renders the same <CareersPage> as the public route, so what you approve here is
 * what ships. Unlike /careers it works before the page is published.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { companySlug } = await params;
  const access = await authorizeCompanyAccess(companySlug);

  if (access.status === "unauthenticated") {
    redirect(`/login?next=/${companySlug}/preview`);
  }
  if (access.status === "not-found") notFound();
  /*
   * A recruiter who does not own this company has nothing to do on a recruiter route,
   * but the company's public page is something they (and anyone) may read — so send
   * them there rather than to a wall. This is what makes browser Back onto a stale
   * builder URL land somewhere useful instead of a dead end.
   *
   * When the page is unpublished there is genuinely nothing to show, so the explicit
   * refusal stands.
   */
  if (access.status === "forbidden") {
    if (access.company.published) redirect(`/${companySlug}/careers`);
    return <NoAccess slug={companySlug} />;
  }

  const { company } = access;
  const [sections, jobs] = await Promise.all([
    getSections(company.id, { visibleOnly: false }),
    getJobs(company.id, { publishedOnly: true }),
  ]);

  const hiddenCount = sections.filter((section) => !section.is_visible).length;

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-ink-800 bg-ink-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
              <Eye aria-hidden="true" className="h-3.5 w-3.5" />
              Preview
            </span>
            <p className="truncate text-sm text-white/70">
              {company.published ? (
                <span className="inline-flex items-center gap-1.5">
                  <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                  Not published yet
                </span>
              )}
              {hiddenCount > 0 ? (
                <span className="ml-3 hidden sm:inline">
                  {hiddenCount} hidden {hiddenCount === 1 ? "section" : "sections"} not
                  shown
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/${company.slug}/edit`}
              className={buttonClasses("secondary", "sm")}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to editor
            </Link>
            {company.published ? (
              <Link
                href={`/${company.slug}/careers`}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline sm:inline-flex"
              >
                Open live page
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <CareersPage data={{ company, sections, jobs }} />
    </>
  );
}
