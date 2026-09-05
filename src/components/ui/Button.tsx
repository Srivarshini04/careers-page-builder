import * as React from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "brand";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 disabled:hover:bg-ink-900 shadow-sm",
  secondary:
    "bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 shadow-sm",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  danger: "text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200",
  /** Uses the company's own palette — only inside the careers page renderer. */
  brand:
    "text-(--brand-on-primary) bg-(--brand-primary) hover:opacity-90 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}

/** Same visual language as Button, for real navigations. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}
