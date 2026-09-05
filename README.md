# Careers Page Builder

> **⚠️ SCAFFOLD — REWRITE BEFORE SUBMITTING.**
> The assignment says the README must not be written by AI. Everything below is a
> skeleton with the *verifiable technical facts* filled in (commands, env vars, routes,
> schema) so you don't have to dig them out again. Every block marked **✍️ YOUR WORDS**
> must be replaced with your own explanation in your own voice. Delete this banner when
> you're done.

---

A small ATS module. Recruiters sign in and build a branded careers page for their
company; candidates visit that company's public page and browse open roles.

**Live demo:** ✍️ _paste your Vercel URL_
**Demo video:** ✍️ _paste your video link_

---

## ✍️ YOUR WORDS — What I built and why

_Two or three paragraphs, first person. Suggested things to cover:_

- _What problem you understood from the brief, in your own framing._
- _The one or two product decisions you're most confident about (e.g. why the builder's
  live preview renders the exact same component as the public page)._
- _What you deliberately left out because of the time box._

---

## Features

**Recruiter**

- Email/password sign in (Supabase Auth), with recruiter routes gated by proxy + RLS
- Branding: company name, tagline, logo, HQ, website, primary/secondary colours (with a
  live WCAG contrast readout), banner image, culture video
- Hero: title and description, which also feed the page's `<title>`/meta description
- Sections: add, edit, rename, change type, show/hide, reorder (Up/Down), remove
- Live preview pane that re-renders on every keystroke, plus a full-screen preview route
- Explicit Save with idle / saving / saved / error states, `⌘S` shortcut, and an
  unsaved-changes guard on navigation
- Publish toggle and one-click copy of the public careers link

**Candidate**

- Fully server-rendered branded careers page, themed from the company's saved colours
- Search by job title, filter by location and job type, clear filters, live result count
- Expandable job cards, polished empty states, mobile-first layout
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

### ✍️ YOUR WORDS — Why this stack

_The evaluation rubric explicitly scores "Tech Stack & Design Choices". Write why **you**
picked these. Points you may or may not agree with — put it in your own words either way:_

- _Next.js App Router: server-rendered HTML matters because a careers page has to be
  crawlable; Server Actions removed the need for a separate API layer._
- _Supabase: Postgres plus auth plus RLS on a free tier, so tenant isolation is enforced
  in the database rather than only in application code._
- _Tailwind: one consistent spacing/type scale without maintaining a CSS architecture._
- _What you would choose differently on a real production build, and why._

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
    page.tsx                      Landing page, lists published companies
    login/                        Recruiter sign in
    go/                           Post-login hop → the recruiter's company builder
    actions/auth.ts               Sign-out server action
    [companySlug]/
      careers/                    PUBLIC candidate page (no loading.tsx — see note in page.tsx)
      preview/                    Recruiter-only full-page preview
      edit/                       The builder (+ actions.ts, loading skeleton)
      not-found.tsx               Unknown or unpublished slug
    robots.ts, sitemap.ts         SEO routes
    error.tsx, not-found.tsx      Global error / 404 boundaries
  components/
    careers/                      CareersPage, Header, Hero, SectionBlock, Footer,
                                  CultureVideo, StructuredData (JSON-LD)
    jobs/                         JobsExplorer, JobFilters, JobCard
    editor/                       EditorShell, BrandingPanel, HeroPanel,
                                  SectionManager, SharePanel
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
  *.test.ts                       Vitest unit tests (36)
  e2e/                            Playwright end-to-end suite (40 checks)
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
2. **Authentication → Users → Add user**
   - Email: `demo@careerbuilder.dev`
   - Password: `demo-recruiter-2024`
   - ✅ **Auto Confirm User** (important — otherwise sign-in fails)
3. **SQL Editor** → paste and run `supabase/schema.sql`.
4. **SQL Editor** → paste and run `supabase/seed.sql`.
   It looks up the demo user by email and fails with a clear message if step 2 was missed.
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

The Supabase **service_role** key is deliberately not used anywhere in this app.

### 5. Run

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm test             # 36 unit tests (no server or database needed)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint

# Optional — end-to-end run against a live dev server + Supabase.
# Needs `npm run dev` running and `npx playwright install chromium`
# (or PW_CHANNEL=chrome to reuse a system Chrome install).
npm run test:e2e     # 40 browser checks; restores demo data when it finishes
npm run reset:demo   # restore the demo companies to their seeded state
```

---

## Demo credentials

```
Email:    demo@careerbuilder.dev
Password: demo-recruiter-2024
```

The login form is prefilled with these.

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
| `/robots.txt`        | Public                | Disallows `/login`, `/go`, `/*/edit`, `/*/preview` |
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
  logo_url                        display_order int            department
  primary_color   hex check       is_visible    bool           description
  secondary_color hex check       created_at                   is_published bool
  hero_title                      updated_at                   created_at
  hero_description                                             updated_at
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

`supabase/seed.sql` creates two companies owned by the demo recruiter:

- **Northwind Labs** (`northwind-labs`) — 5 sections, 10 jobs
- **Lumen Health** (`lumen-health`) — 4 sections (one hidden, to demo visibility), 4 jobs

Jobs span 6 locations and all 4 job types, so the filters have something real to do.
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

## ✍️ YOUR WORDS — Step-by-step user guide

_The brief asks for a walkthrough. Write it as numbered steps you have actually clicked
through, e.g.:_

1. _Go to `/login` and sign in with the demo account…_
2. _You land on the builder for Northwind Labs…_
3. _…_

_Keep it short enough that a reviewer can follow it in two minutes._

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
  invitations or teams.
- **No job application flow** — explicitly out of scope per the brief.

## ✍️ YOUR WORDS — Improvement plan

_What you'd do next, roughly ordered, and why that order. Some candidates:_

- _Job CRUD in the builder_
- _Supabase Storage uploads + `next/image`_
- _ISR/edge caching for anonymous traffic on `/[slug]/careers`_
- _Server-side job search with the trigram index, plus pagination_
- _`company_members` table for real teams and roles_
- _Run the existing Playwright suite in CI against a throwaway Supabase project_

---

## Tests

**Unit tests — `npm test`.** 36 tests covering job search/filter logic, rich-text
parsing, video URL normalisation, brand-colour contrast, and server-side payload
validation. Pure functions only, so they run in under a second with no server or
database.

**End-to-end — `npm run test:e2e`.** 40 checks driving a real browser against a real dev
server and a real Supabase project: sign in, restyle, edit the hero, hide and reorder
sections, save, reload and confirm persistence, preview, the public page, search, both
filters, the empty state, keyboard focus, heading structure, JSON-LD, a real 404 on an
unknown slug, no horizontal overflow at 375px, and tenant separation between the two
companies. It mutates demo data on purpose — proving saves reach Postgres is the point —
then restores the seeded state on the way out.
