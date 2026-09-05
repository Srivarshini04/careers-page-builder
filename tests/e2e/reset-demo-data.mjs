/**
 * Restores the demo companies to their seeded state.
 *
 * The end-to-end run deliberately mutates real data (that is the point — it proves saves
 * persist), so it finishes by calling this. Also useful on its own before recording a
 * demo. Writes go through PostgREST as the demo recruiter, so RLS applies exactly as it
 * does in the app.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.");
  process.exit(1);
}

const PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo-recruiter-2024";

/** Mirrors supabase/seed.sql. Keep in sync if the seed changes. */
const SEED = {
  "northwind-labs": {
    owner: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@careerbuilder.dev",
    company: {
      name: "Northwind Labs",
      tagline: "Developer infrastructure, built in the open",
      primary_color: "#4f46e5",
      secondary_color: "#111a2e",
      hero_title: "Build the tools that other builders depend on.",
      published: true,
    },
    sectionOrder: { about: 0, life: 1, values: 2, benefits: 3, custom: 4 },
    hidden: [],
  },
  "lumen-health": {
    owner: process.env.NEXT_PUBLIC_DEMO_EMAIL_2 ?? "lumen@careerbuilder.dev",
    company: {
      name: "Lumen Health",
      tagline: "Care that reaches further",
      primary_color: "#0f9d76",
      secondary_color: "#0a2e28",
      hero_title: "Make good healthcare reachable for everyone.",
      published: true,
    },
    sectionOrder: { about: 0, values: 1, benefits: 2, custom: 3 },
    hidden: ["custom"],
  },
};

/**
 * Each company has its own recruiter now, and RLS only lets an owner write to their own
 * rows — so the reset signs in per company rather than using one blanket account.
 */
async function headersFor(email) {
  const { access_token: token } = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  }).then((r) => r.json());

  if (!token) {
    console.error(`Could not sign in as ${email}. Is the user created and confirmed?`);
    process.exit(1);
  }

  return { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

for (const [slug, spec] of Object.entries(SEED)) {
  const headers = await headersFor(spec.owner);
  const [company] = await fetch(
    `${url}/rest/v1/companies?slug=eq.${slug}&select=id`,
    { headers },
  ).then((r) => r.json());

  if (!company) {
    console.warn(`skipped ${slug} — not found`);
    continue;
  }

  await fetch(`${url}/rest/v1/companies?id=eq.${company.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(spec.company),
  });

  for (const [type, order] of Object.entries(spec.sectionOrder)) {
    await fetch(
      `${url}/rest/v1/career_sections?company_id=eq.${company.id}&section_type=eq.${type}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          display_order: order,
          is_visible: !spec.hidden.includes(type),
        }),
      },
    );
  }

  console.log(`reset ${slug}`);
}

console.log("Demo data restored to seeded state.");
