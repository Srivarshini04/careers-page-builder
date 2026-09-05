import { toPlainText, truncate } from "@/lib/utils/text";
import type { CareerSection, Company, Job } from "@/types";

/**
 * schema.org JSON-LD for the public careers page.
 *
 * Everything emitted here is derived from real stored data — no invented salaries,
 * no fabricated dates. Fields we genuinely don't have (compensation, validThrough)
 * are omitted rather than guessed, which is also what Google's guidelines require.
 */
export function StructuredData({
  company,
  sections,
  jobs,
  pageUrl,
}: {
  company: Company;
  sections: CareerSection[];
  jobs: Job[];
  pageUrl: string;
}) {
  const about = sections.find((section) => section.section_type === "about");

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website_url || pageUrl,
    ...(company.logo_url ? { logo: company.logo_url } : {}),
    ...(company.tagline ? { slogan: company.tagline } : {}),
    description: truncate(
      toPlainText(about?.content) || company.hero_description || company.hero_title,
      300,
    ),
  };

  const jobPostings = jobs.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || `${job.title} at ${company.name}.`,
    datePosted: job.created_at,
    employmentType: toEmploymentType(job.job_type),
    ...(job.department ? { occupationalCategory: job.department } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      ...(company.website_url ? { sameAs: company.website_url } : {}),
      ...(company.logo_url ? { logo: company.logo_url } : {}),
    },
    ...jobLocationFor(job.location),
    directApply: false,
    url: `${pageUrl}#open-roles`,
  }));

  return (
    <>
      {[organization, ...jobPostings].map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is escaped for safe inline embedding.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}

/** Maps our human-readable job types onto schema.org's controlled vocabulary. */
function toEmploymentType(jobType: string): string {
  const normalized = jobType.toLowerCase().replace(/[\s_-]/g, "");
  const map: Record<string, string> = {
    fulltime: "FULL_TIME",
    parttime: "PART_TIME",
    contract: "CONTRACTOR",
    contractor: "CONTRACTOR",
    internship: "INTERN",
    intern: "INTERN",
    temporary: "TEMPORARY",
  };
  return map[normalized] ?? "OTHER";
}

/**
 * Locations are free text. "Remote" variants map to the remote-job shape Google expects;
 * anything else becomes a Place with the string as its address locality.
 */
function jobLocationFor(location: string) {
  if (/^remote$/i.test(location.trim())) {
    return {
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Worldwide" },
    };
  }

  const remoteMatch = location.match(/^remote\s*[—–-]\s*(.+)$/i);
  if (remoteMatch) {
    return {
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: remoteMatch[1].trim() },
    };
  }

  const [locality, region] = location.split(",").map((part) => part.trim());
  return {
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locality,
        ...(region ? { addressRegion: region } : {}),
      },
    },
  };
}
