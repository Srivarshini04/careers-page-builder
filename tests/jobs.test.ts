import { describe, expect, it } from "vitest";

import { filterJobs, uniqueValues } from "@/lib/utils/jobs";
import type { Job } from "@/types";

/**
 * Candidate-facing search/filter is the behaviour most likely to be broken by a
 * refactor and the hardest to eyeball, so it is the piece that gets unit tests.
 */

function job(overrides: Partial<Job>): Job {
  return {
    id: crypto.randomUUID(),
    company_id: "c1",
    title: "Engineer",
    location: "Remote",
    job_type: "Full Time",
    department: "Engineering",
    description: null,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const JOBS: Job[] = [
  job({ title: "Frontend Engineer", location: "Bengaluru, India", job_type: "Full Time" }),
  job({ title: "Backend Engineer", location: "Bengaluru, India", job_type: "Contract" }),
  job({ title: "Product Designer", location: "Remote", job_type: "Full Time" }),
  job({ title: "Data Analyst", location: "Hyderabad, India", job_type: "Part Time" }),
];

const NO_FILTERS = { query: "", location: "", jobType: "" };

describe("filterJobs", () => {
  it("returns every job when nothing is filtered", () => {
    expect(filterJobs(JOBS, NO_FILTERS)).toHaveLength(4);
  });

  it("matches job titles case-insensitively on a substring", () => {
    const result = filterJobs(JOBS, { ...NO_FILTERS, query: "front" });
    expect(result.map((j) => j.title)).toEqual(["Frontend Engineer"]);
  });

  it("ignores surrounding whitespace in the search term", () => {
    expect(filterJobs(JOBS, { ...NO_FILTERS, query: "  designer  " })).toHaveLength(1);
  });

  it("does not search outside the title", () => {
    // "Engineering" is a department, not a title — searching it must not match.
    expect(filterJobs(JOBS, { ...NO_FILTERS, query: "Engineering" })).toHaveLength(0);
  });

  it("filters by location exactly", () => {
    expect(filterJobs(JOBS, { ...NO_FILTERS, location: "Bengaluru, India" })).toHaveLength(2);
  });

  it("filters by job type exactly", () => {
    expect(filterJobs(JOBS, { ...NO_FILTERS, jobType: "Part Time" })).toHaveLength(1);
  });

  it("combines all three filters", () => {
    const result = filterJobs(JOBS, {
      query: "engineer",
      location: "Bengaluru, India",
      jobType: "Contract",
    });
    expect(result.map((j) => j.title)).toEqual(["Backend Engineer"]);
  });

  it("returns nothing when the combination has no match", () => {
    expect(
      filterJobs(JOBS, { query: "engineer", location: "Remote", jobType: "" }),
    ).toEqual([]);
  });
});

describe("uniqueValues", () => {
  it("de-duplicates and sorts locations", () => {
    expect(uniqueValues(JOBS, "location")).toEqual([
      "Bengaluru, India",
      "Hyderabad, India",
      "Remote",
    ]);
  });

  it("de-duplicates and sorts job types", () => {
    expect(uniqueValues(JOBS, "job_type")).toEqual(["Contract", "Full Time", "Part Time"]);
  });
});
