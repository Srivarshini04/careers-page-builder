/** Skeleton that mirrors the real careers layout, so the page doesn't jump on load. */
export default function CareersLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-white" aria-busy="true">
      <span className="sr-only">Loading careers page…</span>

      <div className="h-16 border-b border-ink-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ink-200" />
            <div className="h-4 w-32 rounded bg-ink-200" />
          </div>
          <div className="h-10 w-28 rounded-lg bg-ink-200" />
        </div>
      </div>

      <div className="bg-ink-100">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="h-5 w-40 rounded-full bg-ink-200" />
          <div className="mt-6 h-12 w-full max-w-xl rounded bg-ink-200" />
          <div className="mt-3 h-12 w-full max-w-md rounded bg-ink-200" />
          <div className="mt-8 h-12 w-48 rounded-lg bg-ink-200" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-52 rounded bg-ink-200" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-xl bg-ink-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
