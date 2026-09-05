"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * One collapsible group in the builder's structure panel.
 *
 * Replaces the previous tab strip: with groups the recruiter can see the whole shape of
 * their page at once and open two at a time, which matters because branding and content
 * are usually edited together. Uses a real button with aria-expanded/aria-controls so it
 * is operable by keyboard and announced correctly.
 */
export function PanelGroup({
  icon: Icon,
  title,
  description,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-b border-ink-200 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-ink-50"
        >
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-500" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-900">{title}</span>
            {description ? (
              <span className="block truncate text-xs text-ink-500">{description}</span>
            ) : null}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-ink-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>

      {open ? (
        <div id={panelId} className="px-4 pt-1 pb-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}
