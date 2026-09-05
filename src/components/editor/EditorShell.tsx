"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ExternalLink,
  ArrowLeft,
  Globe,
  Layers,
  LayoutList,
  LogOut,
  Monitor,
  Palette,
  PanelsTopLeft,
  Save,
  Type,
} from "lucide-react";

import { saveCareersPage, type SaveResult } from "@/app/[companySlug]/edit/actions";
import { signOut } from "@/app/actions/auth";
import { CareersPage } from "@/components/careers/CareersPage";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils/cn";
import type { CareerSection, CompanyDraft, Company, Job, SectionDraft } from "@/types";

import { BrandingPanel } from "./BrandingPanel";
import { HeroPanel } from "./HeroPanel";
import { PanelGroup } from "./PanelGroup";
import { PreviewSurface, type DeviceId } from "./PreviewSurface";
import { SectionManager } from "./SectionManager";
import { SharePanel } from "./SharePanel";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string; details?: string[] };

/**
 * The builder.
 *
 * Draft state lives here and is the single source of truth for both the control panels
 * and the live preview — so every keystroke is reflected in the same `<CareersPage>`
 * component the candidate will eventually see. Nothing is written until Save, which
 * makes the whole edit session cancellable by simply reloading.
 */
export function EditorShell({
  company,
  sections: initialSections,
  jobs,
  publicUrl,
}: {
  company: Company;
  sections: CareerSection[];
  jobs: Job[];
  publicUrl: string;
}) {
  const [draft, setDraft] = useState<CompanyDraft>(() => toDraft(company));
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    initialSections.map(toSectionDraft),
  );
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  // Snapshot of the last persisted state; dirty = draft differs from it.
  const [baseline, setBaseline] = useState(() =>
    serialize(toDraft(company), initialSections.map(toSectionDraft)),
  );
  const current = serialize(draft, sections);
  const isDirty = current !== baseline;

  const updateDraft = useCallback(
    (patch: Partial<CompanyDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
    [],
  );

  const save = useCallback(() => {
    setSaveState({ kind: "saving" });
    const snapshot = current;

    startTransition(async () => {
      const result: SaveResult = await saveCareersPage(company.slug, draft, sections);

      if (!result.ok) {
        setSaveState({
          kind: "error",
          message: result.message,
          details: result.errors,
        });
        return;
      }

      setBaseline(snapshot);
      setSections((prev) => prev.map(persisted));
      setSaveState({ kind: "saved" });
    });
  }, [company.slug, current, draft, sections]);

  // Cmd/Ctrl+S saves, matching what people already do in every other editor.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (isDirty) save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDirty, save]);

  // Guard against losing work on accidental navigation.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const previewData = useMemo(
    () => ({
      company: { ...company, ...draft } as Company,
      sections: sections.map(
        (section, index) =>
          ({
            ...section,
            company_id: company.id,
            display_order: index,
            created_at: company.created_at,
            updated_at: company.updated_at,
          }) as CareerSection,
      ),
      jobs,
    }),
    [company, draft, sections, jobs],
  );

  return (
    /* Fixed app shell on desktop: the window never scrolls, only the structure panel
       and the preview do. Below lg the layout stacks and scrolls normally, which is
       the right behaviour on a phone. */
    <div className="flex min-h-screen flex-col bg-ink-100 lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/*
             * A way out of the builder, on the left where a back control belongs rather
             * than mixed in with the actions on the right. It points at the live page
             * candidates see, and is inert until the page is actually published —
             * `company.published` is the saved value, so toggling Publish without saving
             * must not imply the public URL already works.
             */}
            {company.published ? (
              <Link
                href={`/${company.slug}/careers`}
                className="-ml-1.5 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:ml-0 sm:px-2.5"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">Back to careers page</span>
                <span className="hidden sm:inline lg:hidden">Careers page</span>
              </Link>
            ) : (
              <span
                title="Publish your page from the Publish &amp; share group to open the careers page"
                className="-ml-1.5 inline-flex h-9 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium text-ink-400 sm:ml-0 sm:px-2.5"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">Back to careers page</span>
                <span className="hidden sm:inline lg:hidden">Careers page</span>
              </span>
            )}

            <span
              aria-hidden="true"
              className="hidden h-6 w-px shrink-0 bg-ink-200 sm:block"
            />

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white">
              <Layers aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">
                {draft.name || "Untitled company"}
              </p>
              <p className="truncate font-mono text-xs text-ink-500">/{company.slug}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SaveStatus state={saveState} isDirty={isDirty} />

            {/*
             * Preview is the recruiter's draft, hidden sections included; the live page
             * is reached from the back control on the left. Responsive hiding lives on a
             * wrapper because buttonClasses() sets `inline-flex`, which Tailwind emits
             * after `hidden` — so `hidden sm:inline-flex` on one element never hides.
             * `contents` keeps the button as the direct flex child so gaps still work.
             */}
            <span className="hidden sm:contents">
              <Link
                href={`/${company.slug}/preview`}
                className={buttonClasses("secondary", "sm")}
              >
                <Monitor aria-hidden="true" className="h-4 w-4" />
                Preview
              </Link>
            </span>

            <Button size="sm" onClick={save} disabled={pending || !isDirty}>
              {pending ? (
                <Spinner />
              ) : (
                <Save aria-hidden="true" className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {pending ? "Saving…" : "Save changes"}
              </span>
              <span className="sm:hidden">{pending ? "…" : "Save"}</span>
            </Button>

            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {saveState.kind === "error" ? (
          <div
            role="alert"
            className="border-t border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:px-6"
          >
            <p className="flex items-start gap-2">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {saveState.message}
                {saveState.details?.length ? (
                  <span className="ml-1">{saveState.details.join(" ")}</span>
                ) : null}
              </span>
            </p>
          </div>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:items-stretch">
        {/* Controls */}
        <div className="w-full border-b border-ink-200 bg-white lg:w-100 lg:shrink-0 lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col lg:min-h-0">
            <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-3.5">
              <PanelsTopLeft aria-hidden="true" className="h-4 w-4 text-ink-500" />
              <h2 className="text-sm font-semibold text-ink-900">Page structure</h2>
            </div>

            {/*
             * Collapsible groups rather than tabs, and all closed on arrival: the panel
             * opens as a short table of contents, so the whole shape of the page is
             * visible at a glance and the recruiter chooses what to work on. Any number
             * can be open at once, since branding and content are often edited together.
             */}
            <div className="flex-1 overflow-y-auto lg:min-h-0">
              <PanelGroup
                icon={Palette}
                title="Branding"
                description="Colours, logo, banner and video"
              >
                <BrandingPanel draft={draft} onChange={updateDraft} />
              </PanelGroup>

              <PanelGroup
                icon={Type}
                title="Content"
                description="Hero headline and description"
              >
                <HeroPanel draft={draft} onChange={updateDraft} />
              </PanelGroup>

              <PanelGroup
                icon={LayoutList}
                title="Sections"
                description={`${sections.length} ${sections.length === 1 ? "block" : "blocks"} · ${sections.filter((section) => section.is_visible).length} visible`}
              >
                <SectionManager sections={sections} onChange={setSections} />
              </PanelGroup>

              <PanelGroup
                icon={Globe}
                title="Publish & share"
                description={draft.published ? "Live" : "Not published"}
              >
                <SharePanel draft={draft} onChange={updateDraft} publicUrl={publicUrl} />
              </PanelGroup>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:min-h-0">
          <div className="mb-1 flex justify-end">
            <Link
              href={`/${company.slug}/preview`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 underline-offset-4 hover:underline"
            >
              Full-screen preview
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/*
           * The preview renders the real careers page, so its links are real links —
           * "All companies" or a company website would navigate the recruiter out of
           * the builder and lose unsaved work. In-page anchors still scroll, and buttons
           * (filters, job cards) still work; only outbound navigation is swallowed.
           * Synthetic events bubble through the portal, so this still catches clicks
           * that happen inside the iframe.
           */}
          <div
            className="flex min-h-0 flex-1 flex-col"
            onClickCapture={swallowOutboundClicks}
          >
            <PreviewSurface device={device} onDeviceChange={setDevice}>
              <CareersPage data={previewData} mode="draft" />
            </PreviewSurface>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveStatus({ state, isDirty }: { state: SaveState; isDirty: boolean }) {
  if (state.kind === "saving") {
    return <StatusText>Saving…</StatusText>;
  }
  if (state.kind === "saved" && !isDirty) {
    return (
      <StatusText tone="success">
        <Check aria-hidden="true" className="h-3.5 w-3.5" />
        Saved
      </StatusText>
    );
  }
  if (isDirty) {
    return <StatusText tone="warn">Unsaved changes</StatusText>;
  }
  return null;
}

function StatusText({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "success" | "warn";
}) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "hidden items-center gap-1.5 text-xs font-medium sm:inline-flex",
        tone === "success" && "text-emerald-700",
        tone === "warn" && "text-amber-700",
        tone === "muted" && "text-ink-500",
      )}
    >
      {children}
    </p>
  );
}

function toDraft(company: Company): CompanyDraft {
  return {
    name: company.name,
    tagline: company.tagline,
    logo_url: company.logo_url,
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
    hero_title: company.hero_title,
    hero_description: company.hero_description,
    banner_url: company.banner_url,
    culture_video_url: company.culture_video_url,
    website_url: company.website_url,
    location: company.location,
    published: company.published,
  };
}

function toSectionDraft(section: CareerSection): SectionDraft {
  return {
    id: section.id,
    section_type: section.section_type,
    title: section.title,
    content: section.content,
    image_url: section.image_url,
    display_order: section.display_order,
    is_visible: section.is_visible,
  };
}

/**
 * Keeps clicks inside the live preview from leaving the builder. Same-page anchors
 * (`#open-roles`) are allowed through so the pane still scrolls like the real page.
 */
function swallowOutboundClicks(event: React.MouseEvent<HTMLDivElement>) {
  const anchor = (event.target as HTMLElement).closest("a");
  if (!anchor) return;

  const href = anchor.getAttribute("href") ?? "";
  if (href.startsWith("#")) return;

  event.preventDefault();
}

/** Drops the client-only `isNew` marker so drafts compare and serialise consistently. */
function persisted(section: SectionDraft): SectionDraft {
  return {
    id: section.id,
    section_type: section.section_type,
    title: section.title,
    content: section.content,
    image_url: section.image_url,
    display_order: section.display_order,
    is_visible: section.is_visible,
  };
}

function serialize(draft: CompanyDraft, sections: SectionDraft[]): string {
  return JSON.stringify({ draft, sections: sections.map(persisted) });
}
