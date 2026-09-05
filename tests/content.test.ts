import { describe, expect, it } from "vitest";

import { contrastRatio, normalizeHex, readableTextOn } from "@/lib/utils/color";
import { parseRichText, slugify, toPlainText } from "@/lib/utils/text";
import { toEmbedUrl } from "@/lib/utils/video";

describe("parseRichText", () => {
  it("splits blank-line separated paragraphs", () => {
    const blocks = parseRichText("First para.\n\nSecond para.");
    expect(blocks).toEqual([
      { kind: "paragraph", text: "First para." },
      { kind: "paragraph", text: "Second para." },
    ]);
  });

  it("joins wrapped lines into one paragraph", () => {
    expect(parseRichText("one\ntwo")).toEqual([
      { kind: "paragraph", text: "one two" },
    ]);
  });

  it("turns dash lines into list items and splits heading from body", () => {
    const blocks = parseRichText("- Own it: You decide.\n- Ship early");
    expect(blocks).toEqual([
      {
        kind: "list",
        items: [
          { heading: "Own it", body: "You decide." },
          { heading: "Ship early", body: null },
        ],
      },
    ]);
  });

  it("keeps paragraphs and lists as separate blocks", () => {
    const blocks = parseRichText("Intro line.\n- A: one\n- B: two");
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "list"]);
  });

  it("returns nothing for empty content", () => {
    expect(parseRichText("")).toEqual([]);
    expect(parseRichText("   \n\n  ")).toEqual([]);
  });
});

describe("toPlainText", () => {
  it("flattens bullets and whitespace for meta descriptions", () => {
    expect(toPlainText("- One: a\n\n- Two: b")).toBe("One: a Two: b");
  });

  it("handles null", () => {
    expect(toPlainText(null)).toBe("");
  });
});

describe("slugify", () => {
  it("makes a URL-safe anchor", () => {
    expect(slugify("Life at Northwind!")).toBe("life-at-northwind");
  });
});

describe("toEmbedUrl", () => {
  it("converts a YouTube watch link", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("converts a youtu.be short link", () => {
    expect(toEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("converts a Vimeo link", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  it("rejects anything we cannot safely embed", () => {
    expect(toEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(toEmbedUrl("https://example.com/video.mp4")).toBeNull();
    expect(toEmbedUrl("not a url")).toBeNull();
    expect(toEmbedUrl(null)).toBeNull();
  });
});

describe("brand colour helpers", () => {
  it("expands shorthand hex and falls back on invalid input", () => {
    expect(normalizeHex("#ABC", "#000000")).toBe("#aabbcc");
    expect(normalizeHex("nope", "#4f46e5")).toBe("#4f46e5");
  });

  it("picks the readable foreground for a given brand colour", () => {
    expect(readableTextOn("#111a2e")).toBe("#ffffff");
    expect(readableTextOn("#fde68a")).toBe("#1b1f28");
  });

  it("reports WCAG contrast ratios", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
  });
});
