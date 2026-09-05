type ClassValue = string | false | null | undefined;

/** Tiny class-name joiner. Avoids pulling in clsx/tailwind-merge for this app's needs. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
