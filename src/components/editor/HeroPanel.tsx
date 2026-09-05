"use client";

import { Field, Input, Textarea } from "@/components/ui/Field";
import type { CompanyDraft } from "@/types";

import { PanelSection } from "./PanelSection";

export function HeroPanel({
  draft,
  onChange,
}: {
  draft: CompanyDraft;
  onChange: (patch: Partial<CompanyDraft>) => void;
}) {
  return (
    <div className="space-y-8">
      <PanelSection
        title="Hero"
        description="The first thing a candidate reads. Keep it human and specific."
      >
        <Field
          label="Hero title"
          htmlFor="hero-title"
          hint={`${draft.hero_title.length}/120 characters`}
        >
          <Input
            id="hero-title"
            value={draft.hero_title}
            maxLength={120}
            required
            onChange={(event) => onChange({ hero_title: event.target.value })}
          />
        </Field>

        <Field
          label="Hero description"
          htmlFor="hero-description"
          hint="Two sentences at most — this also becomes your page's meta description."
        >
          <Textarea
            id="hero-description"
            rows={4}
            maxLength={400}
            value={draft.hero_description ?? ""}
            onChange={(event) => onChange({ hero_description: event.target.value })}
          />
        </Field>
      </PanelSection>
    </div>
  );
}
