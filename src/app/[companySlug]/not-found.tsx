import Link from "next/link";
import { Building2 } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

/**
 * Shown for an unknown slug — and for a company whose page isn't published yet, so an
 * unpublished draft can't be distinguished from a non-existent one by a stranger.
 */
export default function CompanyNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Building2 aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        We couldn&apos;t find that careers page
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        The link may be mistyped, or the company hasn&apos;t published its page yet.
        Double-check the address with whoever shared it.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary")}>
          Back to home
        </Link>
        <Link href="/login" className={buttonClasses("secondary")}>
          Recruiter sign in
        </Link>
      </div>
    </main>
  );
}
