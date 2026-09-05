"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils/cn";
import { SECTION_TYPES, type SectionDraft, type SectionType } from "@/types";

import { PanelSection } from "./PanelSection";

const TYPE_LABELS: Record<SectionType, string> = {
  about: "About us",
  life: "Life at the company",
  values: "Our values",
  benefits: "Benefits & perks",
  custom: "Custom section",
};

const TYPE_HINTS: Record<SectionType, string> = {
  about: "Plain paragraphs read best here.",
  life: "Your culture video embeds inside this section.",
  values: "Use “- Title: description” lines — they render as cards.",
  benefits: "Use “- Title: description” lines — they render as cards.",
  custom: "Anything else you want candidates to know.",
};

const STARTER_CONTENT: Record<SectionType, string> = {
  about: "Tell candidates what your company does and why it matters.",
  life: "Describe a normal week on the team — how you work, ship and support each other.",
  values: "- Own the outcome: We trust people to make the call and follow it through.\n- Default to clarity: Write it down, share it early.",
  benefits: "- Health cover: Comprehensive insurance for you and your family.\n- Learning budget: An annual allowance for courses and conferences.",
  custom: "Add your content here.",
};

/**
 * Add / remove / show-hide / reorder for content sections.
 *
 * Reordering is Up/Down buttons rather than drag-and-drop: it is keyboard-operable and
 * screen-reader friendly for free, works on touch without a gesture library, and the
 * ordering itself is just the array index that the Server Action re-derives on save.
 */
export function SectionManager({
  sections,
  onChange,
}: {
  sections: SectionDraft[];
  onChange: (next: SectionDraft[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  const update = (id: string, patch: Partial<SectionDraft>) =>
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((section, order) => ({ ...section, display_order: order })));
  };

  const remove = (id: string) => {
    onChange(
      sections
        .filter((section) => section.id !== id)
        .map((section, order) => ({ ...section, display_order: order })),
    );
  };

  const add = () => {
    // Types already used are skipped so the first click adds something meaningful.
    const used = new Set(sections.map((section) => section.section_type));
    const nextType =
      SECTION_TYPES.find((type) => type !== "custom" && !used.has(type)) ?? "custom";

    const section: SectionDraft = {
      id: crypto.randomUUID(),
      section_type: nextType,
      title: TYPE_LABELS[nextType],
      content: STARTER_CONTENT[nextType],
      display_order: sections.length,
      is_visible: true,
      isNew: true,
    };
    onChange([...sections, section]);
    setOpenId(section.id);
  };

  return (
    <div className="space-y-4">
      <PanelSection
        title="Content sections"
        description="Reorder with the arrows. Hidden sections stay saved but aren't shown to candidates."
      >
        {sections.length === 0 ? (
          <EmptyState
            title="No sections yet"
            description="Add an About us or Benefits section to start telling your story."
            action={
              <Button onClick={add}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add section
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {sections.map((section, index) => {
              const open = openId === section.id;
              const panelId = `section-panel-${section.id}`;

              return (
                <li
                  key={section.id}
                  className={cn(
                    "rounded-xl border bg-white transition-colors",
                    open ? "border-ink-300 shadow-sm" : "border-ink-200",
                    !section.is_visible && "bg-ink-50",
                  )}
                >
                  <div className="flex items-center gap-1 p-2 pl-3">
                    <GripVertical
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-ink-300"
                    />

                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : section.id)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1.5 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-sm font-medium",
                            section.is_visible ? "text-ink-900" : "text-ink-500",
                          )}
                        >
                          {section.title || "Untitled section"}
                        </span>
                        <span className="block truncate text-xs text-ink-500">
                          {TYPE_LABELS[section.section_type]}
                          {section.is_visible ? "" : " · hidden"}
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "h-4 w-4 shrink-0 text-ink-400 transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </button>

                    <div className="flex shrink-0 items-center">
                      <IconButton
                        label={`Move ${section.title} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp aria-hidden="true" className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label={`Move ${section.title} down`}
                        disabled={index === sections.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown aria-hidden="true" className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label={
                          section.is_visible
                            ? `Hide ${section.title}`
                            : `Show ${section.title}`
                        }
                        pressed={!section.is_visible}
                        onClick={() =>
                          update(section.id, { is_visible: !section.is_visible })
                        }
                      >
                        {section.is_visible ? (
                          <Eye aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <EyeOff aria-hidden="true" className="h-4 w-4" />
                        )}
                      </IconButton>
                    </div>
                  </div>

                  {open ? (
                    <div id={panelId} className="space-y-4 border-t border-ink-100 p-4">
                      <Field label="Section type" htmlFor={`type-${section.id}`}>
                        <Select
                          id={`type-${section.id}`}
                          value={section.section_type}
                          onChange={(event) =>
                            update(section.id, {
                              section_type: event.target.value as SectionType,
                            })
                          }
                        >
                          {SECTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {TYPE_LABELS[type]}
                            </option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="Heading" htmlFor={`title-${section.id}`}>
                        <Input
                          id={`title-${section.id}`}
                          value={section.title}
                          maxLength={60}
                          onChange={(event) =>
                            update(section.id, { title: event.target.value })
                          }
                        />
                      </Field>

                      <Field
                        label="Content"
                        htmlFor={`content-${section.id}`}
                        hint={TYPE_HINTS[section.section_type]}
                      >
                        <Textarea
                          id={`content-${section.id}`}
                          rows={7}
                          value={section.content}
                          maxLength={4000}
                          onChange={(event) =>
                            update(section.id, { content: event.target.value })
                          }
                        />
                      </Field>

                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => remove(section.id)}
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Remove section
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {sections.length > 0 ? (
          <Button variant="secondary" onClick={add} className="w-full">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add section
          </Button>
        ) : null}
      </PanelSection>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled,
  pressed,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
