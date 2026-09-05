/**
 * Recruiters type into plain textareas — a rich-text editor is far more scope than this
 * prototype needs. Instead, section content uses two conventions that are obvious to a
 * non-technical user and cheap to render:
 *
 *   - Blank line          -> new paragraph
 *   - Line starting "- "  -> list item, optionally "Heading: supporting copy"
 */

export interface RichTextItem {
  heading: string;
  body: string | null;
}

export type RichTextBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: RichTextItem[] };

export function parseRichText(content: string): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  let paragraph: string[] = [];
  let list: RichTextItem[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of (content ?? "").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      flushParagraph();
      const item = line.slice(2).trim();
      const separator = item.indexOf(": ");
      list.push(
        separator > 0
          ? {
              heading: item.slice(0, separator).trim(),
              body: item.slice(separator + 2).trim(),
            }
          : { heading: item, body: null },
      );
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Flattens content to a single line — used for meta descriptions and JSON-LD. */
export function toPlainText(content: string | null | undefined): string {
  return (content ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•]\s+/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/** URL-safe slug, used when a recruiter renames a company or adds a section anchor. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
