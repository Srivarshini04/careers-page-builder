import { ExternalLink } from "lucide-react";

import type { Company } from "@/types";

import { CompanyLogo } from "./CompanyLogo";

export function CareersFooter({ company }: { company: Company }) {
  return (
    <footer
      className="border-t border-ink-200"
      style={{ background: "var(--brand-secondary)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <CompanyLogo company={company} size={40} />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--brand-on-secondary)" }}
            >
              {company.name}
            </p>
            {company.tagline ? (
              <p
                className="text-sm opacity-70"
                style={{ color: "var(--brand-on-secondary)" }}
              >
                {company.tagline}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-80"
          style={{ color: "var(--brand-on-secondary)" }}
        >
          {company.website_url ? (
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              Company website
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          ) : null}
          <a href="#open-roles" className="underline-offset-4 hover:underline">
            Open roles
          </a>
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
