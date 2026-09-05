import { Terminal } from "lucide-react";

/**
 * Shown instead of a stack trace when the Supabase env vars are missing — the most
 * likely first-run failure for anyone cloning the repo.
 */
export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
      <div className="rounded-xl border border-ink-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
          <Terminal aria-hidden="true" className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">
          Supabase isn&apos;t configured yet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Copy <code className="rounded bg-ink-100 px-1 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-ink-100 px-1 py-0.5">.env.local</code>, fill in
          your project URL and anon key, then restart the dev server. Full steps are in
          the README.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-lg bg-ink-900 p-4 text-xs leading-relaxed text-ink-100">
          {`NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`}
        </pre>
      </div>
    </main>
  );
}
