import Link from "next/link";
import { PenLine, Eye, LayoutGrid } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

/**
 * Platform chrome shown above a company's live careers page — but only to the recruiter
 * who owns it. Candidates and other recruiters never receive this markup at all, so the
 * public page stays a company page rather than an admin screen, and crawlers (always
 * anonymous) never index it.
 *
 * It exists because the live page is otherwise a dead end for its owner: from here the
 * only way back into the builder was to retype the URL.
 */
export function OwnerBar({
  slug,
  companyName,
}: {
  slug: string;
  companyName: string;
}) {
  return (
    <div className="border-b border-ink-800 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="flex min-w-0 items-center gap-2 text-sm text-white/75">
          <Eye aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">
            You&apos;re viewing{" "}
            <span className="font-medium text-white">{companyName}</span> as its owner —
            this is the live page candidates see.
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LayoutGrid aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">All pages</span>
          </Link>
          <Link href={`/${slug}/edit`} className={buttonClasses("secondary", "sm")}>
            <PenLine aria-hidden="true" className="h-4 w-4" />
            Edit page
          </Link>
        </div>
      </div>
    </div>
  );
}
