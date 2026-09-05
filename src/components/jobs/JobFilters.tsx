"use client";

import { Search, X } from "lucide-react";

import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export interface JobFilterState {
  query: string;
  location: string;
  jobType: string;
}

export const EMPTY_FILTERS: JobFilterState = {
  query: "",
  location: "",
  jobType: "",
};

export function JobFilters({
  value,
  onChange,
  onClear,
  locations,
  jobTypes,
  isFiltered,
}: {
  value: JobFilterState;
  onChange: (next: JobFilterState) => void;
  onClear: () => void;
  locations: string[];
  jobTypes: string[];
  isFiltered: boolean;
}) {
  const set = (patch: Partial<JobFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Not a <form>: filtering is live, and there is nothing to submit. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="space-y-1.5">
          <label
            htmlFor="job-search"
            className="block text-sm font-medium text-ink-800"
          >
            Search by job title
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400"
            />
            <input
              id="job-search"
              type="search"
              value={value.query}
              onChange={(event) => set({ query: event.target.value })}
              placeholder="e.g. Frontend Engineer"
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-ink-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="job-location"
            className="block text-sm font-medium text-ink-800"
          >
            Location
          </label>
          <Select
            id="job-location"
            value={value.location}
            onChange={(event) => set({ location: event.target.value })}
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="job-type" className="block text-sm font-medium text-ink-800">
            Job type
          </label>
          <Select
            id="job-type"
            value={value.jobType}
            onChange={(event) => set({ jobType: event.target.value })}
          >
            <option value="">All types</option>
            {jobTypes.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button
            variant="secondary"
            onClick={onClear}
            disabled={!isFiltered}
            className="w-full lg:w-auto"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  );
}
