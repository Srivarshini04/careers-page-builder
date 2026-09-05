/**
 * Small decorative illustrations for the capability cards. Inline SVG rather than image
 * files: no extra requests, crisp at any density, and each one inherits the card's tint
 * through `currentColor` so the set stays visually consistent if the palette changes.
 */

const shared = {
  width: 96,
  height: 64,
  viewBox: "0 0 96 64",
  fill: "none",
  "aria-hidden": true as const,
};

/** Colour swatches and a cursor — branding. */
export function BrandArt({ className }: { className?: string }) {
  return (
    <svg {...shared} className={className}>
      <rect x="30" y="10" width="18" height="18" rx="4" fill="currentColor" opacity="0.9" />
      <rect x="52" y="10" width="18" height="18" rx="4" fill="currentColor" opacity="0.45" />
      <rect x="30" y="32" width="18" height="18" rx="4" fill="currentColor" opacity="0.25" />
      <rect x="52" y="32" width="18" height="18" rx="4" fill="currentColor" opacity="0.6" />
      <path
        d="M66 38l14 11-6 1.5 3 6.5-3.2 1.5-3-6.6L66 56V38z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A list of roles with an add affordance — managing open positions. */
export function RolesArt({ className }: { className?: string }) {
  return (
    <svg {...shared} className={className}>
      <rect x="22" y="8" width="52" height="48" rx="6" fill="currentColor" opacity="0.16" />
      {[16, 27, 38].map((y) => (
        <g key={y}>
          <rect x="28" y={y} width="8" height="6" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="40" y={y + 1} width="28" height="4" rx="2" fill="currentColor" opacity="0.4" />
        </g>
      ))}
      <circle cx="70" cy="48" r="10" fill="currentColor" />
      <path d="M70 43.5v9M65.5 48h9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Connected people — candidate engagement. */
export function TalentArt({ className }: { className?: string }) {
  return (
    <svg {...shared} className={className}>
      <circle cx="48" cy="20" r="9" fill="currentColor" opacity="0.85" />
      <path d="M34 42c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="currentColor" opacity="0.3" />
      <circle cx="24" cy="34" r="7" fill="currentColor" opacity="0.5" />
      <path d="M13 52c0-6 4.9-11 11-11s11 5 11 11" fill="currentColor" opacity="0.2" />
      <circle cx="72" cy="34" r="7" fill="currentColor" opacity="0.5" />
      <path d="M61 52c0-6 4.9-11 11-11s11 5 11 11" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
