"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { filterJobs, uniqueValues } from "@/lib/utils/jobs";
import type { Job } from "@/types";

import { JobCard } from "./JobCard";
import { EMPTY_FILTERS, JobFilters, type JobFilterState } from "./JobFilters";

/**
 * The "Open positions" section: facets + live filtering.
 *
 * The server renders the complete, unfiltered list first (good for crawlers and for
 * a fast first paint); this component narrows it down in memory. `initialFilters`
 * lets a shared URL like `?location=Bengaluru` land pre-filtered without a mismatch
 * between the server and client render.
 */
export function JobsExplorer({
  jobs,
  initialFilters,
}: {
  jobs: Job[];
  initialFilters?: Partial<JobFilterState>;
}) {
  const [filters, setFilters] = useState<JobFilterState>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });

  const locations = useMemo(() => uniqueValues(jobs, "location"), [jobs]);
  const jobTypes = useMemo(() => uniqueValues(jobs, "job_type"), [jobs]);
  const visibleJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const isFiltered =
    Boolean(filters.query) || Boolean(filters.location) || Boolean(filters.jobType);

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<SearchX aria-hidden="true" className="h-5 w-5" />}
        title="No open roles right now"
        description="We're not hiring for any positions at the moment. Check back soon — new roles are posted here first."
      />
    );
  }

  return (
    <div className="space-y-6">
      <JobFilters
        value={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        locations={locations}
        jobTypes={jobTypes}
        isFiltered={isFiltered}
      />

      <p aria-live="polite" className="text-sm text-ink-600">
        Showing <span className="font-semibold text-ink-900">{visibleJobs.length}</span>{" "}
        of {jobs.length} {jobs.length === 1 ? "role" : "roles"}
        {isFiltered ? " matching your filters" : ""}
      </p>

      {visibleJobs.length > 0 ? (
        <ul className="grid items-start gap-4 md:grid-cols-2">
          {visibleJobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<SearchX aria-hidden="true" className="h-5 w-5" />}
          title="No jobs found"
          description="Nothing matches this combination yet. Try a shorter search term, or widen the location and job type filters."
          action={
            <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear all filters
            </Button>
          }
        />
      )}
    </div>
  );
}
