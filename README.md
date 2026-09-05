# Careers Page Builder

A small ATS module. Recruiters sign in and build a branded careers page for their
company; candidates visit that company's public page and browse open roles.

**Live demo:** ✍️ _paste your Vercel URL_
**Demo video:** ✍️ _paste your video link_

---

## What I built and why

I built a Careers Page Builder that helps recruiters create and customize a branded careers page for their company. From the recruiter side, they can sign in, edit the company branding, hero content and different sections, reorder or hide sections, and preview the page before saving it. On the candidate side, the public careers page shows the company information and available jobs, with search and filters for job title, location and job type.

One of the main decisions I made was to use the same `CareersPage` component for the live editor preview, full preview and public careers page. This means the recruiter is previewing the same page that candidates will see, instead of maintaining separate versions. I also used Supabase with PostgreSQL and Row Level Security so that each company's data is kept separate and recruiters can only manage their own company's page.

Since the assignment was time-boxed, I focused on the core careers page builder and candidate job browsing experience. I deliberately left out features such as a complete job application flow, advanced team management and job CRUD. These are things I would consider adding if I had more time.

---

## Features

**Recruiter**

- Email/password sign in (Supabase Auth), with recruiter routes gated by proxy + RLS
- Branding: company name, tagline, logo, HQ, website, primary/secondary colours (with a
  live WCAG contrast readout), banner image, culture video
- Hero: title and description, which also feed the page's `<title>`/meta description
- Sections: add, edit, rename, change type, show/hide, reorder (Up/Down), remove, plus an
  optional supporting image on the editorial section types
- Live preview that re-renders on every keystroke, with Desktop / Tablet / Mobile device
  modes rendered in a real iframe viewport, plus a full-screen preview route
- Explicit Save with idle / saving / saved / error states, `⌘S` shortcut, and an
  unsaved-changes guard on navigation
- Publish toggle and one-click copy of the public careers link
- An owner-only bar on the live careers page linking straight back into the builder —
  rendered for that company's recruiter alone, never for candidates or other recruiters

**Candidate**

- Fully server-rendered branded careers page, themed from the company's saved colours
- Search by job title, filter by location and job type, clear filters, live result count
- Job cards open the full role in a modal built on the native `<dialog>` element
- Polished empty states, mobile-first layout
- SEO: dynamic title/description, canonical URL, Open Graph + Twitter tags,
  `Organization` and `JobPosting` JSON-LD, `robots.txt`, `sitemap.xml`

---

## Tech stack

| Layer     | Choice                                  |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions) |
| Language  | TypeScript (strict)                     |
| UI        | React 19, Tailwind CSS v4, lucide-react |
| Database  | Supabase Postgres + Row Level Security  |
| Auth      | Supabase Auth (`@supabase/ssr`)         |
| Tests     | Vitest (unit) + Playwright (end-to-end) |
| Hosting   | Vercel                                  |

---

### Why this stack

I chose Next.js with the App Router because the public careers page needs to be SEO-friendly and crawlable by search engines. Server-rendered pages help make the company and job information available in the initial HTML. The App Router also gave me a clean structure for the recruiter and candidate routes, and Server Actions allowed me to handle save operations without creating a separate API layer.

I chose Supabase because it provides PostgreSQL, authentication, and Row Level Security in one platform. For this project, RLS was especially important because it allows tenant isolation to be enforced at the database level. This means a recruiter should only be able to access and modify the company data they are authorized to manage, rather than relying only on checks in the application code.

I used Tailwind CSS because it allowed me to build the interface quickly while keeping spacing, typography, and responsive behavior consistent. It was a good fit for the time-boxed nature of the assignment because I could focus on the product and user experience without maintaining a large custom CSS architecture.

For a real production system, I would consider adding a more formal design system, server-side search and pagination for a much larger number of jobs, and proper image storage/CDN support instead of relying on image URLs. I would also consider more advanced organization and role management if multiple recruiters needed to manage the same company.

---

## Architecture

```
Browser
  │
  ├─ Server Components ─────► lib/db/queries.ts ──► Supabase (anon key + RLS)
  │    /, /[slug]/careers, /[slug]/preview, /[slug]/edit
  │
  ├─ Client Components ─────► local draft state only
  │    EditorShell, JobsExplorer
  │
  └─ Server Action ─────────► authorizeCompanyAccess ──► validation ──► Postgres
       saveCareersPage()                                                (RLS re-checks)
```

Three things worth knowing:

1. **One renderer, three surfaces.** `components/careers/CareersPage.tsx` is used by the
   public page, the full-screen preview and the builder's live pane. The only difference
   is where the data comes from and whether hidden sections are dimmed or dropped, so
   the preview cannot drift from what candidates see.
2. **No service-role key anywhere.** Every query runs as the visitor (anon or the
   signed-in recruiter) through RLS. A bug in application code cannot leak another
   company's data.
3. **Defence in depth on writes.** Proxy (is anyone signed in) → `authorizeCompanyAccess`
   (does this user own this slug) → server-side validation → RLS policy. `company_id` is
   taken from the authorized company, never from the request body.

---

## Folder structure

```
src/
  app/
    page.tsx                      Landing page: hero, feature cards, company directory
    login/                        Recruiter sign in
    go/                           Resolves a recruiter's company (fallback + workspace link)
    actions/auth.ts               Sign-out server action
    [companySlug]/
      careers/                    PUBLIC candidate page (no loading.tsx — see note in page.tsx)
      preview/                    Recruiter-only full-page preview
      edit/                       The builder (+ actions.ts, loading skeleton)
      not-found.tsx               Unknown or unpublished slug
    robots.ts, sitemap.ts         SEO routes
    error.tsx, not-found.tsx      Global error / 404 boundaries
  components/
    home/                         CompanyDirectory (filterable), PagePreview
    careers/                      CareersPage, Header, Hero, SectionBlock, Footer,
                                  CultureVideo, OwnerBar, StructuredData (JSON-LD)
    jobs/                         JobsExplorer, JobFilters, JobCard, JobDialog
    editor/                       EditorShell, PanelGroup, PreviewSurface,
                                  BrandingPanel, HeroPanel, SectionManager, SharePanel
    ui/                           Button, Field/Input/Textarea/Select, ColorPicker,
                                  RichText, Primitives (Badge/Toggle/EmptyState/Spinner)
  lib/
    supabase/                     Browser + server clients, env guards
    db/                           queries.ts, authz.ts, validation.ts
    utils/                        color, text, video, jobs (filtering), url, cn
    auth/demo.ts                  Demo credential constants
  types/index.ts                  Domain types mirroring the schema
  proxy.ts                        Session refresh + recruiter route gate
supabase/
  schema.sql                      Tables, indexes, triggers, RLS policies
  seed.sql                        2 demo companies, 9 sections, 14 jobs
  migrations/                     Policy changes applied after the initial schema
tests/
  *.test.ts                       Vitest unit tests (38)
  e2e/                            Playwright end-to-end suite (65 checks)
```

---

## Setup

### 1. Prerequisites

Node.js 20+ and a free [Supabase](https://supabase.com) project.

### 2. Install

```bash
npm install
```

### 3. Create the Supabase project

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Authentication → Users → Add user** — twice, one recruiter per company.
   Tick ✅ **Auto Confirm User** on both (otherwise sign-in fails).
   - `demo@careerbuilder.dev` / `demo-recruiter-2024` → owns Northwind Labs
   - `lumen@careerbuilder.dev` / `demo-recruiter-2024` → owns Lumen Health
3. **SQL Editor** → paste and run `supabase/schema.sql`.
4. **SQL Editor** → paste and run `supabase/seed.sql`.
   It looks up both recruiters by email and fails with a clear message if either is missing.
5. **Project Settings → API** → copy the Project URL and the `anon` `public` key.

### 4. Environment variables

```bash
cp .env.example .env.local
```

| Variable                        | Required | Purpose                                                  |
| ------------------------------- | -------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Supabase project URL                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Public anon key — safe in the browser, constrained by RLS |
| `NEXT_PUBLIC_SITE_URL`          | —        | Absolute origin for canonical/OG/JSON-LD. Inferred if unset |
| `NEXT_PUBLIC_DEMO_EMAIL`        | —        | Prefills the login form                                   |
| `NEXT_PUBLIC_DEMO_PASSWORD`     | —        | Prefills the login form                                   |
| `NEXT_PUBLIC_DEMO_EMAIL_2`      | —        | Second demo account shown on the login screen             |
| `NEXT_PUBLIC_DEMO_PASSWORD_2`   | —        | Second demo account shown on the login screen             |

The Supabase **service_role** key is deliberately not used anywhere in this app.

### 5. Run

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm test             # 38 unit tests (no server or database needed)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint

# Optional — end-to-end run against a live dev server + Supabase.
# Needs `npm run dev` running and `npx playwright install chromium`
# (or PW_CHANNEL=chrome to reuse a system Chrome install).
npm run test:e2e     # 65 browser checks; restores demo data when it finishes
npm run reset:demo   # restore the demo companies to their seeded state
```

---

## Demo credentials

One recruiter per company, so tenant isolation is demonstrable rather than assumed —
sign in as one and the other company's builder is blocked by Row Level Security, not
just hidden in the UI.

| Company        | Email                     | Password              |
| -------------- | ------------------------- | --------------------- |
| Northwind Labs | `demo@careerbuilder.dev`  | `demo-recruiter-2024` |
| Lumen Health   | `lumen@careerbuilder.dev` | `demo-recruiter-2024` |

The login form is prefilled with the first account; the demo panel switches between them.

---

## Routes

| Route                | Access                | What it does                                    |
| -------------------- | --------------------- | ----------------------------------------------- |
| `/`                  | Public                | Landing page; lists published careers pages     |
| `/login`             | Public                | Recruiter sign in                               |
| `/go`                | Authenticated         | Redirects to the recruiter's own company builder |
| `/[slug]/edit`       | Owner only            | The builder                                     |
| `/[slug]/preview`    | Owner only            | Full-page preview, including hidden sections    |
| `/[slug]/careers`    | Public                | The candidate careers page                      |
| `/robots.txt`        | Public                | Disallows `/login`, `/go`, `/preview-frame`, `/*/edit`, `/*/preview` |
| `/sitemap.xml`       | Public                | Lists every published careers page              |

Seeded slugs: **`northwind-labs`** and **`lumen-health`**
→ `http://localhost:3000/northwind-labs/careers`

---

## Database schema

```
auth.users
    │ 1
    │
    ▼ n
companies                       career_sections              jobs
  id            uuid pk           id            uuid pk        id           uuid pk
  owner_id      → auth.users      company_id    → companies    company_id   → companies
  name                            section_type  enum-ish       title
  slug          unique            title                        location
  tagline                         content                      job_type     enum-ish
  logo_url                        image_url                    department
  primary_color   hex check       display_order int            description
  secondary_color hex check       is_visible    bool           is_published bool
  hero_title                      created_at                   created_at
  hero_description                updated_at                   updated_at
  banner_url            1 ─────────────► n
  culture_video_url     1 ────────────────────────────────────► n
  website_url
  location
  published     bool
  created_at / updated_at
```

**Indexes:** `companies.slug` (unique), `companies.owner_id`, partial index on
`companies.published`, `career_sections(company_id, display_order)`,
`jobs(company_id, is_published)`, `jobs(company_id, location)`,
`jobs(company_id, job_type)`, and a GIN trigram index on `jobs.title`.

**RLS policies:**

| Table             | Read                                            | Write                       |
| ----------------- | ----------------------------------------------- | --------------------------- |
| `companies`       | `published OR owner_id = auth.uid()`            | `owner_id = auth.uid()`     |
| `career_sections` | parent company readable                          | parent company owned        |
| `jobs`            | parent readable AND (`is_published` OR owner)    | parent company owned        |

**One deliberate deviation:** long-form content (About us, Life at…, Values, Benefits)
lives only in `career_sections`, not as duplicated `about_content` / `life_content`
columns on `companies`. Sections are already ordered and toggleable, so a second copy
would just be two sources of truth to keep in sync.

### Sample data

`supabase/seed.sql` creates two companies, each owned by its own recruiter:

- **Northwind Labs** (`northwind-labs`) — 5 sections, 10 jobs
- **Lumen Health** (`lumen-health`) — 4 sections (one hidden, to demo visibility), 4 jobs

Jobs span 5 locations and all 4 job types, so the filters have something real to do.
The seed is idempotent — re-running resets both companies to this state.

---

## Deploying to Vercel

1. Push to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detects as Next.js).
3. Add environment variables for **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel URL to
   **Site URL** / **Redirect URLs**.

No other configuration is required; the same Supabase project serves local and production.

---

## Step-by-step user guide

1. Go to `/login` and sign in using the demo recruiter account. The form is prefilled
   with the Northwind Labs recruiter; the panel below it switches to Lumen Health.

2. After signing in, you are taken to the **Northwind Labs** builder page. The left side contains the editing controls and the right side shows the live careers page preview.

3. Use the **Branding** options to change the company colors and update the hero/banner content. The preview updates as you make changes.

4. In the **Sections** area, hide a section such as **Benefits and perks**, and use the reorder controls to change the order of the visible sections.

5. Use the responsive preview options to check how the careers page looks on desktop, tablet, and mobile.

6. Click **Save** to persist the changes. Reload the page to confirm that the saved settings are still present.

7. Open the **Preview** or public careers page and verify that the same branding and section changes are displayed.

8. On the public careers page, use the **job search** box and filters such as **Location** and **Job Type** to find relevant openings.

9. Click **View role** on a job card to open the full description in a modal, and check the page at mobile width to make sure the layout remains usable.

10. The public careers page can then be shared using the company's careers URL.

---

## Known limitations

These are real and worth stating plainly rather than hiding:

- **Images are URLs, not uploads.** Logos and banners are recruiter-supplied links, so
  the app uses plain `<img>` rather than `next/image` (which needs a per-host allow-list).
  Production would upload to Supabase Storage and serve one known origin through the
  optimizer.
- **Job management is seed-only.** The builder edits branding and content; jobs are
  seeded via SQL. The brief scoped the recruiter flow to the careers page itself.
- **Filtering is client-side.** All published jobs for one company are sent to the browser
  and filtered in memory — correct and instant at tens of jobs, wrong at thousands.
- **Every page is dynamically rendered.** No ISR or edge caching yet, because the
  Supabase client reads auth cookies on every request.
- **Single owner per company.** `companies.owner_id` is one user; there are no roles,
  invitations or teams. Each demo company has its own recruiter, but a company cannot
  have two.
- **No job application flow** — explicitly out of scope per the brief.

## Improvement plan

My first priority would be to add **job CRUD** to the builder so recruiters can create, edit, and remove job postings without depending on seed data. This would make the builder more complete and useful as a real product.

Next, I would improve the media handling by using **Supabase Storage** for company logos, banners, and other uploaded assets, together with `next/image` for better image optimization. After that, I would improve the public careers pages with **ISR/edge caching**, since anonymous candidates will generate most of the traffic and the pages do not need to be regenerated for every request.

For companies with a large number of jobs, I would move search and filtering to the **server side**, use the existing trigram index, and add pagination instead of loading all jobs on the client. I would then add a `company_members` table with roles and permissions so multiple recruiters can manage the same company.

Finally, I would run the existing **Playwright test suite in CI** against a throwaway Supabase project. This would make the deployment process more reliable and ensure that important recruiter and candidate flows continue to work as the application evolves.

---

## Tests

**Unit tests — `npm test`.** 38 tests covering job search/filter logic, rich-text
parsing, video URL normalisation, brand-colour contrast, and server-side payload
validation. Pure functions only, so they run in under a second with no server or
database.

**End-to-end — `npm run test:e2e`.** 65 checks driving a real browser against a real dev
server and a real Supabase project: sign in, restyle, edit the hero, hide and reorder
sections, save, reload and confirm persistence, preview, the public page, search, both
filters, the empty state, keyboard focus, heading structure, JSON-LD, a real 404 on an
unknown slug, no horizontal overflow at 375px, and tenant isolation — signing in as one
recruiter and being redirected off the other company's builder. It mutates demo data on
purpose — proving saves reach Postgres is the
point — then restores the seeded state on the way out.
