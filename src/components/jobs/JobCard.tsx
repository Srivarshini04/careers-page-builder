"use client";

import { useId, useState } from "react";
import { Briefcase, ChevronDown, Clock, MapPin } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Job } from "@/types";

/**
 * Cards expand in place rather than linking to a detail route: the assignment scopes
 * out the application flow, and keeping candidates in the filtered list is fewer taps
 * on mobile. The full description is always in the DOM for crawlers.
 */
export function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-ink-900">
            {job.title}
          </h3>
          {job.department ? (
            <p className="mt-1 text-sm text-ink-500">{job.department}</p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--brand-primary-soft) px-3 py-1 text-xs font-semibold text-(--brand-secondary)">
          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
          {job.job_type}
        </span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-600">
        <li className="inline-flex items-center gap-1.5">
          <MapPin aria-hidden="true" className="h-4 w-4 text-ink-400" />
          {job.location}
        </li>
        {job.department ? (
          <li className="inline-flex items-center gap-1.5">
            <Briefcase aria-hidden="true" className="h-4 w-4 text-ink-400" />
            {job.department}
          </li>
        ) : null}
      </ul>

      {job.description ? (
        <>
          <div
            id={detailsId}
            className={cn(
              "mt-4 text-sm leading-relaxed whitespace-pre-line text-ink-600",
              !expanded && "line-clamp-2",
            )}
          >
            {job.description}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="mt-3 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-(--brand-primary) hover:underline"
          >
            {expanded ? "Show less" : "Read full description"}
            {/* Keeps the label unique when several cards are read out in a row. */}
            <span className="sr-only"> for {job.title}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        </>
      ) : null}
    </article>
  );
}
