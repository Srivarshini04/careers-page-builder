export default function EditorLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-ink-100" aria-busy="true">
      <span className="sr-only">Loading the careers page builder…</span>
      <div className="h-16 border-b border-ink-200 bg-white" />
      <div className="flex flex-col lg:flex-row">
        <div className="w-full space-y-4 border-r border-ink-200 bg-white p-6 lg:w-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-11 rounded-lg bg-ink-100" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="h-[70vh] rounded-xl border border-ink-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
