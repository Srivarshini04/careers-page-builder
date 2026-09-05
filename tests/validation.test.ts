import { describe, expect, it } from "vitest";

import { validateCompanyDraft, validateSections } from "@/lib/db/validation";

/** Server-side guards for the builder payload — nothing from the client is trusted. */

const VALID_DRAFT = {
  name: "Northwind Labs",
  hero_title: "Build the future",
  primary_color: "#4f46e5",
  secondary_color: "#111a2e",
};

describe("validateCompanyDraft", () => {
  it("accepts a well-formed draft", () => {
    const result = validateCompanyDraft(VALID_DRAFT);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("requires a company name and a hero title", () => {
    const result = validateCompanyDraft({ name: "  ", hero_title: "" });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it("rejects a non-http URL", () => {
    const result = validateCompanyDraft({
      ...VALID_DRAFT,
      logo_url: "javascript:alert(1)",
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/Logo URL/);
  });

  it("rejects a malformed hex colour", () => {
    const result = validateCompanyDraft({ ...VALID_DRAFT, primary_color: "red" });
    expect(result.ok).toBe(false);
  });

  it("normalises empty optional strings to null", () => {
    const result = validateCompanyDraft({ ...VALID_DRAFT, tagline: "   " });
    expect(result.value.tagline).toBeNull();
  });

  it("coerces published to a boolean", () => {
    expect(validateCompanyDraft(VALID_DRAFT).value.published).toBe(false);
    expect(
      validateCompanyDraft({ ...VALID_DRAFT, published: true }).value.published,
    ).toBe(true);
  });
});

describe("validateSections", () => {
  const section = (overrides = {}) => ({
    id: crypto.randomUUID(),
    section_type: "about" as const,
    title: "About us",
    content: "Hello",
    display_order: 99,
    is_visible: true,
    ...overrides,
  });

  it("re-derives display_order from array position", () => {
    const result = validateSections([section(), section({ title: "Values" })]);
    expect(result.ok).toBe(true);
    expect(result.value.map((s) => s.display_order)).toEqual([0, 1]);
  });

  it("falls back to the custom type for an unknown section_type", () => {
    const result = validateSections([section({ section_type: "hacked" })]);
    expect(result.value[0].section_type).toBe("custom");
  });

  it("rejects a section with no title", () => {
    const result = validateSections([section({ title: "" })]);
    expect(result.ok).toBe(false);
  });

  it("rejects a non-uuid id so a client cannot invent primary keys", () => {
    const result = validateSections([section({ id: "1; drop table jobs" })]);
    expect(result.ok).toBe(false);
  });

  it("treats a non-array payload as no sections", () => {
    expect(validateSections(null).value).toEqual([]);
  });

  it("accepts an http(s) section image and normalises a blank one to null", () => {
    const withImage = validateSections([
      section({ image_url: "https://example.com/team.jpg" }),
    ]);
    expect(withImage.ok).toBe(true);
    expect(withImage.value[0].image_url).toBe("https://example.com/team.jpg");

    expect(validateSections([section({ image_url: "   " })]).value[0].image_url).toBeNull();
  });

  it("rejects an unsafe section image URL", () => {
    const result = validateSections([section({ image_url: "javascript:alert(1)" })]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/image/i);
  });
});
