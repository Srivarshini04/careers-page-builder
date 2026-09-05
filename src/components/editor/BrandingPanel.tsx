"use client";

import { Image as ImageIcon, Video } from "lucide-react";

import { ColorPicker } from "@/components/ui/ColorPicker";
import { Field, Input } from "@/components/ui/Field";
import { toEmbedUrl } from "@/lib/utils/video";
import type { CompanyDraft } from "@/types";

import { PanelSection } from "./PanelSection";

const PRESETS: { name: string; primary: string; secondary: string }[] = [
  { name: "Indigo", primary: "#4f46e5", secondary: "#0f172a" },
  { name: "Emerald", primary: "#059669", secondary: "#052e2b" },
  { name: "Coral", primary: "#e11d48", secondary: "#1c1917" },
  { name: "Ocean", primary: "#0284c7", secondary: "#0c2233" },
  { name: "Amber", primary: "#d97706", secondary: "#231a10" },
];

export function BrandingPanel({
  draft,
  onChange,
}: {
  draft: CompanyDraft;
  onChange: (patch: Partial<CompanyDraft>) => void;
}) {
  const videoIsValid = !draft.culture_video_url || Boolean(toEmbedUrl(draft.culture_video_url));

  return (
    <div className="space-y-8">
      <PanelSection
        title="Identity"
        description="How candidates recognise you at a glance."
      >
        <Field label="Company name" htmlFor="company-name">
          <Input
            id="company-name"
            value={draft.name}
            maxLength={80}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>

        <Field
          label="Tagline"
          htmlFor="company-tagline"
          hint="One short line, shown in the page footer."
        >
          <Input
            id="company-tagline"
            value={draft.tagline ?? ""}
            maxLength={140}
            placeholder="Infrastructure for modern teams"
            onChange={(event) => onChange({ tagline: event.target.value })}
          />
        </Field>

        <Field
          label="Logo URL"
          htmlFor="company-logo"
          hint="Square image works best. Leave blank to use a monogram."
        >
          <Input
            id="company-logo"
            type="url"
            inputMode="url"
            value={draft.logo_url ?? ""}
            placeholder="https://…/logo.png"
            onChange={(event) => onChange({ logo_url: event.target.value })}
          />
        </Field>

        <Field
          label="Headquarters"
          htmlFor="company-location"
          hint="Shown next to the hero call to action."
        >
          <Input
            id="company-location"
            value={draft.location ?? ""}
            placeholder="Bengaluru, India"
            onChange={(event) => onChange({ location: event.target.value })}
          />
        </Field>

        <Field label="Company website" htmlFor="company-website">
          <Input
            id="company-website"
            type="url"
            inputMode="url"
            value={draft.website_url ?? ""}
            placeholder="https://example.com"
            onChange={(event) => onChange({ website_url: event.target.value })}
          />
        </Field>
      </PanelSection>

      <PanelSection
        title="Brand colours"
        description="Applied across buttons, headings and the footer."
      >
        <div>
          <p className="mb-2 text-sm font-medium text-ink-800">Quick palettes</p>
          <ul className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const active =
                draft.primary_color.toLowerCase() === preset.primary &&
                draft.secondary_color.toLowerCase() === preset.secondary;
              return (
                <li key={preset.name}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        primary_color: preset.primary,
                        secondary_color: preset.secondary,
                      })
                    }
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                    }`}
                  >
                    <span className="flex">
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-l"
                        style={{ background: preset.primary }}
                      />
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-r"
                        style={{ background: preset.secondary }}
                      />
                    </span>
                    {preset.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <ColorPicker
          label="Primary colour"
          value={draft.primary_color}
          onChange={(value) => onChange({ primary_color: value })}
        />
        <ColorPicker
          label="Secondary colour"
          value={draft.secondary_color}
          onChange={(value) => onChange({ secondary_color: value })}
        />
      </PanelSection>

      <PanelSection
        title="Media"
        description="Banner and culture video shown on the careers page."
      >
        <Field
          label="Banner image URL"
          htmlFor="company-banner"
          hint="Wide image (roughly 1600×900). Sits behind the hero text."
        >
          <Input
            id="company-banner"
            type="url"
            inputMode="url"
            value={draft.banner_url ?? ""}
            placeholder="https://…/office.jpg"
            onChange={(event) => onChange({ banner_url: event.target.value })}
          />
        </Field>

        {draft.banner_url ? (
          <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.banner_url}
              alt="Banner preview"
              className="h-28 w-full object-cover"
            />
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-3 py-4 text-xs text-ink-500">
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
            No banner yet — the hero falls back to a brand gradient.
          </p>
        )}

        <Field
          label="Culture video URL"
          htmlFor="company-video"
          hint="YouTube or Vimeo link. Appears inside your “Life at…” section."
          error={
            videoIsValid ? undefined : "We can only embed YouTube or Vimeo links."
          }
        >
          <Input
            id="company-video"
            type="url"
            inputMode="url"
            value={draft.culture_video_url ?? ""}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-invalid={!videoIsValid}
            onChange={(event) => onChange({ culture_video_url: event.target.value })}
          />
        </Field>

        {videoIsValid && draft.culture_video_url ? (
          <p className="flex items-center gap-2 text-xs text-emerald-700">
            <Video aria-hidden="true" className="h-4 w-4" />
            Video will embed on the page.
          </p>
        ) : null}
      </PanelSection>
    </div>
  );
}
