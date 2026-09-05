"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type DeviceId = "desktop" | "tablet" | "mobile";

/**
 * Each device renders at a real viewport width, chosen to land in a different Tailwind
 * breakpoint band: mobile below `sm`, tablet between `md` and `lg`, desktop above `xl`.
 */
const DEVICES: {
  id: DeviceId;
  label: string;
  width: number;
  icon: typeof Monitor;
}[] = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 834, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
];

const CHROME_HEIGHT = 36;

/** Empty same-origin document; see src/app/preview-frame/route.ts for why. */
const FRAME_SRC = "/preview-frame";

/**
 * Renders the live preview inside an iframe and portals the React tree into it.
 *
 * The iframe is the whole point: the careers page is styled with viewport media queries,
 * so narrowing a plain <div> would squeeze the desktop layout and show the recruiter
 * something a phone never renders. An iframe has its own viewport, so `sm:`/`lg:` resolve
 * against the selected device width — and because the tree is portalled rather than
 * re-navigated, it still updates on every keystroke.
 *
 * The iframe is laid out at the device's true width and then scaled to fit the pane, so
 * "Desktop" shows a genuine 1280px layout rather than whatever the pane happens to be.
 */
export function PreviewSurface({
  device,
  onDeviceChange,
  children,
}: {
  device: DeviceId;
  onDeviceChange: (device: DeviceId) => void;
  children: React.ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });

  /** Mirror the host document's stylesheets and font variables into the iframe. */
  const syncStyles = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    doc.head.querySelectorAll("[data-preview-style]").forEach((node) => node.remove());
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-preview-style", "");
      doc.head.appendChild(clone);
    });

    // The Inter font is exposed as a CSS variable on <html>.
    doc.documentElement.className = document.documentElement.className;
    doc.documentElement.lang = "en";
    doc.body.className = "antialiased";
    doc.body.style.margin = "0";
  }, []);

  /*
   * The iframe points at a real same-origin route rather than about:blank, so embedded
   * players get a referrer (YouTube rejects referrer-less embeds with error 153). That
   * means waiting for the navigation to land: the transient about:blank document is
   * skipped, and the listener stays attached so a re-navigation re-portals cleanly.
   */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const attach = () => {
      const doc = iframe.contentDocument;
      if (!doc || doc.readyState === "loading") return;
      if (!doc.URL.includes(FRAME_SRC)) return;
      syncStyles();
      setMountNode(doc.body);
    };

    iframe.addEventListener("load", attach);
    attach();
    return () => iframe.removeEventListener("load", attach);
  }, [syncStyles]);

  /* Next swaps <style> tags on hot reload; without this the preview keeps stale CSS. */
  useEffect(() => {
    if (!mountNode) return;
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mountNode, syncStyles]);

  useLayoutEffect(() => {
    const node = areaRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setArea({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const active = DEVICES.find((entry) => entry.id === device) ?? DEVICES[0];
  const scale = area.width ? Math.min(1, area.width / active.width) : 1;
  const frameWidth = Math.round(active.width * scale);
  const viewportHeight = Math.max(area.height - CHROME_HEIGHT, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-600">
          Live preview
          <span className="ml-2 text-xs font-normal text-ink-500">
            updates as you type
          </span>
        </p>

        <div
          role="group"
          aria-label="Preview device size"
          className="flex items-center gap-0.5 rounded-lg border border-ink-200 bg-white p-0.5"
        >
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onDeviceChange(id)}
              aria-pressed={device === id}
              title={label}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                device === id
                  ? "bg-ink-900 text-white"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={areaRef} className="flex min-h-0 flex-1 justify-center overflow-hidden">
        <div
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm"
          style={{ width: frameWidth || undefined }}
        >
          <div
            className="flex shrink-0 items-center gap-1.5 border-b border-ink-200 bg-ink-50 px-3"
            style={{ height: CHROME_HEIGHT }}
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ink-300" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ink-300" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ink-300" />
            <p className="ml-2 truncate text-xs text-ink-500">
              {active.width}px
              {scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
            </p>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <iframe
              ref={iframeRef}
              src={FRAME_SRC}
              title="Careers page live preview"
              className="absolute top-0 left-0 border-0"
              style={{
                width: active.width,
                height: viewportHeight ? viewportHeight / scale : "100%",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
          {mountNode ? createPortal(children, mountNode) : null}
        </div>
      </div>
    </div>
  );
}
