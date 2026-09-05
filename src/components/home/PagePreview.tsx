import { readableTextOn, rgba } from "@/lib/utils/color";

/**
 * A miniature of a company's careers page, composed from what that company has actually
 * saved: banner, brand colours, logo, hero title and its real job titles. It mirrors the
 * live hero treatment, so it updates the moment a recruiter changes their branding.
 *
 * Deliberately rendered rather than screenshotted — a captured thumbnail needs a job to
 * refresh it and misrepresents the page the moment it goes stale.
 */
export function PagePreview({
  name,
  primaryColor,
  secondaryColor,
  bannerUrl,
  logoUrl,
  heroTitle,
  jobTitles,
}: {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  heroTitle: string;
  jobTitles: string[];
}) {
  const monogram = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  const onSecondary = readableTextOn(secondaryColor);

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm select-none"
    >
      {/* header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-ink-100 px-1.5 py-1">
        <div className="flex min-w-0 items-center gap-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] object-contain"
            />
          ) : (
            <span
              className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] text-[4px] leading-none font-bold"
              style={{ background: primaryColor, color: readableTextOn(primaryColor) }}
            >
              {monogram || "•"}
            </span>
          )}
          <span className="truncate text-[4px] leading-none font-semibold text-ink-800">
            {name}
          </span>
        </div>
        <span
          className="shrink-0 rounded-[2px] px-1 py-0.5 text-[3.5px] leading-none font-semibold"
          style={{ background: primaryColor, color: readableTextOn(primaryColor) }}
        >
          Open roles
        </span>
      </div>

      {/* hero */}
      <div className="relative isolate" style={{ background: secondaryColor }}>
        {bannerUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: `linear-gradient(100deg, ${rgba(secondaryColor, 0.95)} 0%, ${rgba(secondaryColor, 0.68)} 100%)`,
              }}
            />
          </>
        ) : null}

        <div className="px-2 py-3">
          <p
            className="line-clamp-2 text-[6px] leading-[1.25] font-bold"
            style={{ color: onSecondary }}
          >
            {heroTitle}
          </p>
          <span
            className="mt-1.5 inline-block rounded-[2px] px-1.5 py-0.5 text-[3.5px] leading-none font-semibold"
            style={{ background: primaryColor, color: readableTextOn(primaryColor) }}
          >
            View open roles
          </span>
        </div>
      </div>

      {/* open roles */}
      <div className="grid grid-cols-2 gap-1 p-1.5">
        {Array.from({ length: 4 }).map((_, index) => {
          const title = jobTitles[index % Math.max(jobTitles.length, 1)];
          return (
            <div
              key={index}
              className="space-y-0.5 rounded-[3px] border border-ink-100 p-1"
            >
              <p className="truncate text-[3.5px] leading-none font-semibold text-ink-700">
                {title ?? "Open role"}
              </p>
              <span className="block h-[2px] w-1/2 rounded-full bg-ink-200" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
