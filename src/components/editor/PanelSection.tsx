export function PanelSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h3 className="text-xs font-semibold tracking-[0.12em] text-ink-500 uppercase">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
