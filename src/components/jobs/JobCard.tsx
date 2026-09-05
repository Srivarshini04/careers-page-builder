"use client";

import { useState } from "react";
import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react";

import type { Job } from "@/types";

import { JobDialog } from "./JobDialog";

/**
 * A role in the list. The card carries enough to decide whether to look closer — title,
 * team, location, type and an opening line — and the full description opens in a modal.
 *
 * The visible snippet stays in the markup (and the whole description ships in the page's
 * JobPosting JSON-LD), so moving the detail into a dialog costs nothing for crawlers.
 */
export function JobCard({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);

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
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600">
          {job.description}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-(--brand-primary) hover:underline"
      >
        View role
        {/* Keeps the label unique when several cards are read out in a row. */}
        <span className="sr-only"> details for {job.title}</span>
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </button>

      <JobDialog job={job} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
