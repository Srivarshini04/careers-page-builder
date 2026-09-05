import type { Job } from "@/types";

export interface JobFilterInput {
  query: string;
  location: string;
  jobType: string;
}

/**
 * Pure filtering so it can be unit-tested without React.
 *
 * Job counts per company are small (tens), so filtering the already-fetched list in the
 * browser is instant and avoids a round trip per keystroke. At ATS scale this same
 * signature moves to a Postgres query with a trigram index on `title` — see Tech Spec.
 */
export function filterJobs(jobs: Job[], filters: JobFilterInput): Job[] {
  const query = filters.query.trim().toLowerCase();

  return jobs.filter((job) => {
    if (query && !job.title.toLowerCase().includes(query)) return false;
    if (filters.location && job.location !== filters.location) return false;
    if (filters.jobType && job.job_type !== filters.jobType) return false;
    return true;
  });
}

/** Sorted, de-duplicated facet values built from the jobs actually on the page. */
export function uniqueValues(jobs: Job[], key: "location" | "job_type"): string[] {
  return Array.from(
    new Set(jobs.map((job) => job[key]).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}
