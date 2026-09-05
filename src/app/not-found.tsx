import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Compass aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-7 flex justify-center">
        <Link href="/" className={buttonClasses("primary")}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
