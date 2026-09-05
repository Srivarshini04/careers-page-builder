import type { Company } from "@/types";

/**
 * Logos are recruiter-supplied URLs on arbitrary hosts, so we use a plain <img>
 * rather than next/image (which needs an allow-list per host). Production would
 * upload to Supabase Storage and serve through the optimizer — see Tech Spec.
 */
export function CompanyLogo({
  company,
  size = 40,
  className,
}: {
  company: Pick<Company, "name" | "logo_url" | "primary_color">;
  size?: number;
  className?: string;
}) {
  if (company.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={company.logo_url}
        alt={`${company.name} logo`}
        width={size}
        height={size}
        className={`shrink-0 rounded-lg object-contain ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Monogram fallback keeps the header from collapsing when no logo is set yet.
  const initials = company.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg font-semibold text-(--brand-on-primary) ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: "var(--brand-primary)",
        fontSize: size * 0.4,
      }}
    >
      {initials || "•"}
    </span>
  );
}
