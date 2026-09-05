"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production would forward this to Sentry/Logtail — see Tech Spec §Monitoring.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        We hit an unexpected error loading this page. Trying again usually fixes it.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-400">ref: {error.digest}</p>
      ) : null}
      <div className="mt-7 flex justify-center">
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
