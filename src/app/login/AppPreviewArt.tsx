/**
 * A miniature of the builder UI for the sign-in page's marketing panel.
 *
 * Drawn with CSS rather than shipped as a screenshot: no image asset to keep in sync
 * with a UI that is still changing, and nothing that misrepresents the product if the
 * layout moves. Decorative, so it is hidden from assistive technology.
 */
export function AppPreviewArt() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-white/15 bg-white shadow-2xl"
    >
      {/* app header */}
      <div className="flex items-center justify-between border-b border-ink-200 px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-ink-900" />
          <span className="h-1.5 w-16 rounded-full bg-ink-200" />
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-9 rounded bg-ink-100" />
          <span className="h-3 w-12 rounded bg-ink-900" />
        </div>
      </div>

      <div className="flex h-44">
        {/* structure panel */}
        <div className="w-1/3 shrink-0 space-y-2 border-r border-ink-200 p-2">
          <span className="block h-1.5 w-14 rounded-full bg-ink-300" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="space-y-1 rounded border border-ink-100 p-1.5">
              <span className="block h-1 w-12 rounded-full bg-ink-300" />
              <span className="block h-1 w-8 rounded-full bg-ink-200" />
            </div>
          ))}
          <span className="block h-4 rounded bg-ink-100" />
        </div>

        {/* live preview */}
        <div className="min-w-0 flex-1 bg-ink-50 p-2">
          <div className="h-full overflow-hidden rounded-md border border-ink-200 bg-white">
            <div className="flex items-center gap-1 border-b border-ink-100 bg-ink-50 px-1.5 py-1">
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span className="h-1 w-1 rounded-full bg-ink-300" />
            </div>
            <div className="space-y-1.5 bg-[#111a2e] px-2.5 py-4">
              <span className="block h-2 w-4/5 rounded-full bg-white/80" />
              <span className="block h-2 w-3/5 rounded-full bg-white/45" />
              <span className="mt-1 block h-3 w-14 rounded bg-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-1 p-1.5">
              {[0, 1, 2, 3].map((card) => (
                <div key={card} className="space-y-1 rounded border border-ink-100 p-1">
                  <span className="block h-1 w-3/4 rounded-full bg-ink-300" />
                  <span className="block h-1 w-1/2 rounded-full bg-ink-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
