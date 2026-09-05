"use client";

import { useEffect, useRef } from "react";
import { Briefcase, Clock, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Job } from "@/types";

/**
 * Full role detail, in a modal.
 *
 * Built on the native <dialog> element rather than a hand-rolled overlay: focus
 * trapping, Escape to close, inert background content and the top layer all come for
 * free and behave correctly, which is a lot of accessibility to reimplement badly.
 *
 * The card still renders a visible snippet and the page still emits the complete
 * description in JobPosting JSON-LD, so nothing a crawler needs is only inside a
 * closed dialog.
 */
export function JobDialog({
  job,
  open,
  onClose,
}: {
  job: Job;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `job-dialog-${job.id}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape and the close button both fire the native `close` event; keep React in sync.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // A click on the backdrop targets the dialog element itself, not its contents.
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-2xl rounded-2xl p-0 backdrop:bg-ink-900/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 p-5 sm:p-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl"
            >
              {job.title}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-600">
              <li className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="h-4 w-4 text-ink-400" />
                {job.location}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Clock aria-hidden="true" className="h-4 w-4 text-ink-400" />
                {job.job_type}
              </li>
              {job.department ? (
                <li className="inline-flex items-center gap-1.5">
                  <Briefcase aria-hidden="true" className="h-4 w-4 text-ink-400" />
                  {job.department}
                </li>
              ) : null}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={`Close ${job.title}`}
            className="-mt-1 -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-700">
            {job.description || `We'll share more about this role when you get in touch.`}
          </p>
        </div>

        <div className="flex justify-end border-t border-ink-200 p-4 sm:px-6">
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
