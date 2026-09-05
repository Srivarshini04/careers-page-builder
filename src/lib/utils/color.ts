/**
 * Brand colours are recruiter-supplied, so contrast can't be assumed at design time.
 * These helpers derive readable foreground colours and tints from whatever they pick,
 * which keeps the public page accessible regardless of the palette.
 */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(value: string): boolean {
  return HEX.test(value.trim());
}

export function normalizeHex(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!isValidHex(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex, "#000000").slice(1);
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Black or white text, whichever is more readable on the given background. */
export function readableTextOn(background: string): "#ffffff" | "#1b1f28" {
  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#1b1f28")
    ? "#ffffff"
    : "#1b1f28";
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const DEFAULT_PRIMARY = "#4f46e5";
export const DEFAULT_SECONDARY = "#0f172a";

/** CSS custom properties applied to the careers page root so children can theme off them. */
export function brandStyle(
  primaryInput: string,
  secondaryInput: string,
): React.CSSProperties {
  const primary = normalizeHex(primaryInput, DEFAULT_PRIMARY);
  const secondary = normalizeHex(secondaryInput, DEFAULT_SECONDARY);

  return {
    "--brand-primary": primary,
    "--brand-secondary": secondary,
    "--brand-on-primary": readableTextOn(primary),
    "--brand-on-secondary": readableTextOn(secondary),
    "--brand-primary-soft": rgba(primary, 0.1),
    "--brand-primary-line": rgba(primary, 0.22),
  } as React.CSSProperties;
}
