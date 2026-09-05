"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Globe, Lock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Primitives";
import type { CompanyDraft } from "@/types";

import { PanelSection } from "./PanelSection";

export function SharePanel({
  draft,
  onChange,
  publicUrl,
}: {
  draft: CompanyDraft;
  onChange: (patch: Partial<CompanyDraft>) => void;
  publicUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <PanelSection
        title="Visibility"
        description="Publishing makes the careers link reachable by anyone."
      >
        <div className="rounded-xl border border-ink-200 bg-white p-4">
          <Toggle
            id="publish-toggle"
            checked={draft.published}
            onChange={(published) => onChange({ published })}
            label={draft.published ? "Published" : "Unpublished"}
          />
          <p className="mt-3 flex items-start gap-2 text-sm text-ink-600">
            {draft.published ? (
              <>
                <Globe aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Live. Anyone with the link can view your careers page, and search
                  engines can index it.
                </span>
              </>
            ) : (
              <>
                <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                <span>
                  Private. Visitors get a not-found page — only you can see it, through
                  Preview.
                </span>
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-ink-500">
            Remember to press Save for a visibility change to take effect.
          </p>
        </div>
      </PanelSection>

      <PanelSection
        title="Public link"
        description="Share this with candidates, or drop it into a job post."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={publicUrl}
            aria-label="Public careers page URL"
            onFocus={(event) => event.currentTarget.select()}
            className="h-11 w-full min-w-0 rounded-lg border border-ink-200 bg-ink-50 px-3 font-mono text-xs text-ink-700"
          />
          <Button variant="secondary" onClick={copy} className="shrink-0">
            {copied ? (
              <>
                <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? "Link copied to clipboard" : ""}
        </span>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 underline-offset-4 hover:underline"
        >
          Open the public page
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </PanelSection>
    </div>
  );
}
