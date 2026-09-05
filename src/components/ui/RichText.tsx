import { parseRichText } from "@/lib/utils/text";
import { cn } from "@/lib/utils/cn";

/**
 * Renders recruiter-authored section content. Paragraphs stay as prose; bullet lists
 * become a card grid, which is what makes "Our Values" / "Benefits" look designed
 * rather than like a dumped textarea.
 */
export function RichText({
  content,
  className,
  listAs = "cards",
}: {
  content: string;
  className?: string;
  listAs?: "cards" | "bullets";
}) {
  const blocks = parseRichText(content);
  if (!blocks.length) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p
              key={index}
              className="text-base leading-relaxed text-ink-600 sm:text-lg sm:leading-relaxed"
            >
              {block.text}
            </p>
          );
        }

        if (listAs === "bullets") {
          return (
            <ul key={index} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex gap-3 text-base leading-relaxed text-ink-600"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--brand-primary)"
                  />
                  <span>
                    <span className="font-medium text-ink-900">{item.heading}</span>
                    {item.body ? ` — ${item.body}` : null}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ul key={index} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 block h-1 w-8 rounded-full bg-(--brand-primary)"
                />
                <h3 className="text-base font-semibold text-ink-900">
                  {item.heading}
                </h3>
                {item.body ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
