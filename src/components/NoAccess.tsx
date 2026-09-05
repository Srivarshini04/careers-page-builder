import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

/** Shown when a signed-in recruiter opens a company they don't own. */
export function NoAccess({ slug }: { slug: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        You don&apos;t have access to this company
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        Your account isn&apos;t an owner of{" "}
        <span className="font-mono text-ink-800">{slug}</span>. Sign in with the right
        account, or head back to your own workspace.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/go" className={buttonClasses("primary")}>
          Go to my workspace
        </Link>
        <Link href={`/${slug}/careers`} className={buttonClasses("secondary")}>
          View public careers page
        </Link>
      </div>
    </main>
  );
}
