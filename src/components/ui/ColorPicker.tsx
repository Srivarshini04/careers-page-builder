"use client";

import { useId } from "react";

import { contrastRatio, isValidHex, readableTextOn } from "@/lib/utils/color";

import { Field, Input } from "./Field";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Colour this one is checked against, so we can warn about unreadable pairings. */
  contrastAgainst?: string;
}

/**
 * A native colour swatch plus a hex field (recruiters often paste a brand hex).
 * Shows the live WCAG contrast of white/black text on the chosen colour, which is
 * the accessibility decision the recruiter is actually making here.
 */
export function ColorPicker({
  label,
  value,
  onChange,
  contrastAgainst,
}: ColorPickerProps) {
  const id = useId();
  const valid = isValidHex(value);
  const reference = contrastAgainst ?? readableTextOn(valid ? value : "#000000");
  const ratio = valid ? contrastRatio(value, reference) : 0;
  const passes = ratio >= 4.5;

  return (
    <Field
      label={label}
      htmlFor={id}
      error={valid ? undefined : "Enter a valid hex colour, e.g. #4f46e5"}
    >
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
          aria-label={`${label} colour swatch`}
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="font-mono uppercase"
          aria-invalid={!valid}
        />
      </div>
      {valid ? (
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <span
            className="inline-block rounded px-1.5 py-0.5 font-medium"
            style={{ background: value, color: readableTextOn(value) }}
          >
            Aa
          </span>
          <span>
            Contrast {ratio.toFixed(1)}:1 —{" "}
            {passes ? "readable" : "low, text may be hard to read"}
          </span>
        </p>
      ) : null}
    </Field>
  );
}
