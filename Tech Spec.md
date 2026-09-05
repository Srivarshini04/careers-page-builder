# Tech Spec — Careers Page Builder

## 1. Problem

Companies on an ATS want a careers page that looks like *their* brand, tells their
story, and makes open roles easy to find — especially on a phone. Today that page
either looks like the ATS vendor or requires engineering time the company doesn't have.

### How I read the problem

I understood the problem as building a careers page that allows a company to present its brand, culture, and open positions in one place instead of relying on a generic ATS-style careers page. The recruiter should be able to customize the page without needing a developer, while candidates should be able to easily understand the company and find relevant jobs.

I interpreted the brief as having two main experiences: a **recruiter experience** for editing, previewing, and saving the careers page, and a **candidate experience** for viewing the published page and searching/filtering open roles. I also treated SEO, accessibility, and mobile responsiveness as important parts of the product rather than optional extras, because the careers page is primarily a public-facing page that candidates need to discover and use easily.

---

## 2. Goals

- A recruiter can brand and structure their careers page without a developer
- What the recruiter previews is exactly what a candidate sees
- Each company's data is stored and isolated separately
- A candidate can find a relevant role in a few taps on a phone
- The public page is crawlable and carries valid structured data
- The architecture holds up at hundreds of companies without a rewrite

## 3. Non-goals

- The job application flow (explicitly out of scope in the brief)
- Job CRUD in the recruiter UI (jobs come from the seed / would come from the ATS)
- Custom domains, multi-language, A/B testing, analytics dashboards
- Teams, roles and invitations — one owner per company for the prototype

### What was cut, and why

The **job application flow** was genuinely out of scope because the brief explicitly says that candidates do not need to apply for jobs through this product. I also treated features like custom domains, multi-language support, A/B testing, and analytics dashboards as outside the scope of this prototype because they are separate product areas.

For features such as **job CRUD, team/role management, image uploads, and advanced search**, I mainly decided to cut them because of the time limit. I wanted to spend the available time making the core recruiter editing experience and candidate careers page work well rather than adding more features with less refinement. In a production version, I would add these features based on the actual product requirements and scale.

---

## 4. Assumptions

1. One recruiter owns one company, and one company has one recruiter. Multi-recruiter
   teams are a later table, not a later rewrite.
2. Job counts per company are in the tens, not thousands — so client-side filtering is honest.
3. Jobs are authored elsewhere (the ATS); this module renders and filters them.
4. Recruiters have image URLs available; uploads are a hosting concern, not a product one.
5. Content is plain text with a light bullet convention, not rich HTML — avoids an
   editor, a sanitiser, and an XSS surface.
6. The public page must work with JavaScript disabled for crawlers; filtering is progressive.

---

## 5. Architecture

```
                    ┌──────────────────────────────────────┐
   Candidate ──────►│  /[slug]/careers   (Server Component)│
                    │  server-rendered HTML + JSON-LD      │
                    └──────────────┬───────────────────────┘
                                   │  JobsExplorer (client) filters in memory
                                   │
                    ┌──────────────▼───────────────────────┐
   Recruiter ──────►│  /[slug]/edit      (Server Component)│
                    │   └─ EditorShell   (client, draft)   │
                    │        └─ CareersPage  ← same render │
                    └──────────────┬───────────────────────┘
                                   │  Server Action: saveCareersPage()
                                   ▼
                    proxy.ts ─► authorizeCompanyAccess ─► validation ─► Postgres (RLS)
```

**Key structural decision:** `components/careers/CareersPage.tsx` is a plain (non-async)
component rendered by all three surfaces — public page, `/preview`, and the builder's
live pane. `mode="draft"` dims hidden sections instead of removing them. There is no
second implementation of the careers page to keep in sync.

**Rendering split:**

| Concern                        | Where              | Why                                     |
| ------------------------------ | ------------------ | --------------------------------------- |
| Company/section/job fetching   | Server Component   | Crawlable HTML, no client DB credentials |
| Job search & filter            | Client Component   | Instant, no round trip per keystroke     |
| Builder draft state            | Client Component   | Live preview without saving             |
| Persistence                    | Server Action      | No hand-written API layer to secure     |

### The call I'd defend, and the one I'm unsure about

The architectural decision I would defend most is using the same `CareersPage` component for the public careers page, preview page, and the live preview in the builder. This keeps the rendering logic in one place, so what the recruiter sees while editing is consistent with what candidates see after publishing. It also makes the code easier to maintain because I don't have to update multiple implementations of the same page.

The decision I am less sure about is **client-side job filtering**. I chose it because the demo has a small number of jobs and it gives instant results without making a database request for every search or filter change. However, I know this approach will not scale well if a company has hundreds or thousands of jobs. In a production version, I would move the search and filtering to the server and add pagination.

---

## 6. Data model

### Tables

**`companies`** — one tenant, one row.
`id`, `owner_id → auth.users`, `name`, `slug` (unique, regex-checked), `tagline`,
`logo_url`, `primary_color`, `secondary_color` (both hex-constrained), `hero_title`,
`hero_description`, `banner_url`, `culture_video_url`, `website_url`, `location`,
`published`, `created_at`, `updated_at`.

**`career_sections`** — ordered content blocks.
`id`, `company_id → companies` (cascade), `section_type`
(`about | life | values | benefits | custom`), `title`, `content`, `image_url`,
`display_order`, `is_visible`, timestamps.

**`jobs`** — open roles.
`id`, `company_id → companies` (cascade), `title`, `location`, `job_type`
(`Full Time | Part Time | Contract | Internship`), `department`, `description`,
`is_published`, timestamps.

### Relationships

`auth.users 1—n companies 1—n career_sections` and `companies 1—n jobs`.
Both children cascade on company delete. Every child row carries `company_id`, so no
query can accidentally span tenants.

### Indexes and why each exists

| Index                                    | Serves                                    |
| ---------------------------------------- | ----------------------------------------- |
| `companies.slug` unique                  | Every page load starts with a slug lookup |
| `companies.owner_id`                     | Post-login "which company do I own"       |
| `companies.published` (partial)          | Landing page + sitemap                    |
| `career_sections(company_id, display_order)` | Sections fetched ordered, per company |
| `jobs(company_id, is_published)`         | The main jobs query                       |
| `jobs(company_id, location)`             | Location facet when filtering moves server-side |
| `jobs(company_id, job_type)`             | Job type facet                            |
| `jobs.title` GIN trigram                 | Substring title search without a scan     |

### Deliberate deviation

Long-form content lives **only** in `career_sections`, not duplicated as
`about_content` / `life_content` columns on `companies`. Sections are already ordered,
typed and toggleable; a second copy would be two sources of truth for the same text.

### Whether I agree

Yes, I agree with this decision because keeping the long-form content only in `career_sections` gives me a single source of truth. Since sections already have their own type, order, visibility, and content, storing the same information again in the `companies` table would make the data model more complicated and could lead to inconsistent data.

With more time, I would make the section model more flexible by supporting reusable section templates and more customizable section types. I would still keep the actual content in `career_sections`, but I would consider adding a configuration field for sections that need different layouts or additional options.

---

## 7. Authentication

Supabase Auth, email + password, cookie-based sessions via `@supabase/ssr`.

- `src/proxy.ts` refreshes the session cookie on every navigation and redirects
  anonymous visitors away from `/[slug]/edit` and `/[slug]/preview` (preserving `?next=`).
- Server Components and Server Actions build a Supabase client from the request cookies,
  so Postgres sees the real `auth.uid()`.
- Sign-in resolves the recruiter's company from the session it just obtained and goes
  straight to that builder — bouncing through `/go` cost an extra server round trip on
  the slowest moment in the app. `/go` remains as the fallback and as the target of
  "Go to my workspace".

## 8. Authorization and data isolation

Four layers, outermost first:

1. **Proxy** — is anyone signed in at all?
2. **`authorizeCompanyAccess(slug)`** — returns `unauthenticated | not-found | forbidden | ok`
   so the UI can render sign-in vs. 404 vs. "not your company" instead of a raw DB error.
3. **Validation** (`lib/db/validation.ts`) — shape, length, hex colours, `http(s)`-only URLs,
   UUID-shaped ids, and `display_order` re-derived from array position so a client can't
   send a broken sequence.
4. **Postgres RLS** — the actual boundary.

| Table             | Read policy                                    | Write policy            |
| ----------------- | ---------------------------------------------- | ----------------------- |
| `companies`       | `published OR owner_id = auth.uid()`           | `owner_id = auth.uid()` |
| `career_sections` | parent company readable                        | parent company owned    |
| `jobs`            | parent readable AND (`is_published` OR owner)  | parent company owned    |

The app never uses the **service_role** key. `company_id` on writes comes from the
authorized company, never from the request body. There is no `DELETE` policy on
`companies`.

### How edits update the page safely

When a recruiter saves changes, the request goes through authentication, company ownership checks, and server-side validation before the data is updated in Supabase. The company ID is taken from the authorized company rather than being trusted from the client, and Row Level Security provides another layer of protection at the database level. This makes sure that a recruiter cannot use the save request to modify another company's data.

One limitation is that I currently save the sections as a whole list, so if the same page is edited in two tabs at the same time, the latest save can overwrite the earlier one. There is also no audit history showing previous versions of the page. With more time, I would add optimistic locking using a version number or `updated_at` check and possibly keep a revision history so conflicting edits could be detected or recovered.

---

## 9. Data flow

**Read (candidate):**
`slug → getCompanyBySlug → getSections(visibleOnly) + getJobs(publishedOnly) in parallel
→ CareersPage + StructuredData → HTML`. Unpublished or unknown slug → `not-found.tsx`.

**Write (recruiter):**
`EditorShell draft state → saveCareersPage(slug, draft, sections) → authorize → validate
→ UPDATE companies → DELETE removed sections → UPSERT remaining → revalidatePath()`.

Sections are saved as a whole-list replace rather than per-field patches: ordering,
deletion and edits are one atomic-feeling operation, and the client never has to track
which individual rows changed.

### The concurrency trade-off

I chose to save the sections as a whole list because it keeps the save logic simple and makes reordering, adding, removing, and editing sections easier to handle together. The trade-off is that it currently follows a **last-write-wins** approach, so changes from one tab could overwrite changes made in another tab.

If I were taking this further, I would add a `version` column or use the `updated_at` value when saving. The server could check that the version the recruiter edited is still the current version before updating the data. If it has changed, I would reject the save and ask the recruiter to reload the latest version instead of silently overwriting someone else's changes.

---

## 10. SEO

- Dynamic `<title>` and meta description from the company's hero content
- Canonical URL, Open Graph and Twitter Card tags (banner image when set)
- Server-rendered HTML — all sections and all jobs are in the initial response
- `Organization` JSON-LD + one `JobPosting` per job, with `employmentType` mapped to
  schema.org's vocabulary and `Remote` mapped to `TELECOMMUTE`
- Fields we don't have (salary, `validThrough`) are **omitted, not invented**
- `robots.txt` disallows `/login`, `/go`, `/*/edit`, `/*/preview`; `sitemap.xml` lists
  every published careers page
- `/preview` and `/login` carry `robots: noindex`

## 11. Accessibility

- Semantic landmarks: `header`, `main`, `section` (each `aria-labelledby`), `nav`, `footer`
- One `h1` per page; section headings are `h2`, cards `h3`
- Every control has a real `<label>` — placeholders are never used as labels
- Role detail uses a native `<dialog>`, so focus trapping, Escape and inert background
  come from the platform; disclosure buttons use `aria-expanded` + `aria-controls`;
  toggle buttons use `aria-pressed`
- Result counts and save status are `aria-live="polite"`
- A single visible focus style, tinted with the company's own brand colour
- "Skip to open roles" link as the first focusable element
- The colour picker shows the live WCAG contrast ratio, because the recruiter is the one
  making the accessibility decision
- `readableTextOn()` computes black-or-white text per brand colour so any palette stays legible
- `prefers-reduced-motion` respected globally

### What I actually tested

I mainly tested the accessibility using **keyboard navigation**, checking that the interactive elements were reachable in a logical order and that the focus state was clearly visible. I also checked that form controls had proper labels, the headings followed a logical structure, and the page worked properly at mobile widths. I verified the automated tests, build, lint, and typecheck as well.

I did not get enough time to do a complete **screen-reader test** or a full **Lighthouse/accessibility audit**. Those would be part of my next testing step if I were taking the project further toward production.

---

## 12. Responsive design

Mobile-first, breakpoints at `sm` 640 / `md` 768 / `lg` 1024.

| Surface       | Mobile                              | Desktop                          |
| ------------- | ----------------------------------- | -------------------------------- |
| Careers header| Back link + logo + "Open roles"     | Adds section nav links           |
| Hero          | Stacked, 20/24 padding              | 32 padding, constrained measure   |
| Filters       | Stacked full-width controls         | 4-column row                     |
| Job list      | Single column                       | Two-column grid, top-aligned     |
| Builder       | Panels stacked, page scrolls        | Fixed app shell; only panel + preview scroll |
| Section cards | Wrapping icon-button row            | Same, roomier                    |

`min-width: 0` is applied globally and `overflow-x: hidden` on `body` to kill horizontal
scroll from long unbroken strings.

## 13. Testing

**Automated (Vitest, 38 tests):**

- `tests/jobs.test.ts` — search/filter/facets, including that search matches title only
- `tests/content.test.ts` — rich-text parsing, plain-text flattening, slugs,
  video URL normalisation (including rejecting `javascript:`), colour contrast
- `tests/validation.test.ts` — required fields, unsafe URLs, bad hex, unknown section
  types coerced to `custom`, non-UUID ids rejected, `display_order` re-derivation

**End-to-end (Playwright, 65 checks — `npm run test:e2e`):**

Drives a real browser against a real dev server and a real Supabase project, covering
the numbered manual plan below plus JSON-LD shape, heading structure, focus visibility,
a genuine 404 status on an unknown slug, zero horizontal overflow at 375px, and tenant
separation. It mutates demo data deliberately (proving a save reaches Postgres is the
whole point) and restores the seeded state when it finishes.

**Manual test plan:**

| # | Step                                     | Expected |
| - | ---------------------------------------- | -------- |
| 1 | Sign in with demo credentials            | Lands on `/northwind-labs/edit` |
| 1b| Sign in as `lumen@`, open `/northwind-labs/edit` | Redirected to that company's public careers page |
| 1c| Own careers page while signed in         | Owner bar with Edit page; absent when anonymous |
| 2 | Visit `/[slug]/edit` signed out          | Redirect to `/login?next=…` |
| 3 | Change primary colour                    | Live pane restyles immediately |
| 4 | Edit hero title                          | Live pane updates per keystroke |
| 5 | Hide a section                           | Dims + "Hidden" label in preview |
| 6 | Reorder a section (Up/Down)              | Order changes in the live pane |
| 7 | Add and remove a section                 | Appears/disappears correctly |
| 8 | Save                                     | "Saving…" → "Saved"; button disables when clean |
| 9 | Reload the editor                        | All changes persisted |
| 10| Open `/[slug]/preview`                   | Same render, hidden sections dimmed |
| 11| Open `/[slug]/careers`                   | Hidden sections gone |
| 12| Search "front"                           | Only Frontend Engineer |
| 13| Filter location                          | Count updates, list narrows |
| 14| Filter job type                          | Combines with the others |
| 15| Impossible combination                   | "No jobs found" empty state |
| 16| Clear filters                            | Full list restored, button disables |
| 17| Unpublish + save, open `/careers`        | Not-found page |
| 18| Unknown slug                             | Not-found page |
| 19| 375px viewport, all pages                | No horizontal scroll |
| 20| Keyboard only through the builder        | Everything reachable, focus visible |
| 21| View source on `/careers`                | Jobs and JSON-LD present in HTML |
| 22| Rich Results Test on the live URL        | Organization + JobPosting valid |

### Test notes

I tested the main recruiter and candidate flows rather than only checking whether the application builds. I tested login, changing the primary colour, editing the hero title, hiding and reordering sections, adding and removing sections, saving and reloading the editor, opening the preview and public careers page, searching and filtering jobs, clearing filters, and checking the empty state. I also checked the unknown company URL, unpublished pages, the 375px mobile layout, keyboard navigation, and the presence of the job data and JSON-LD in the page HTML.

During development, I had a few issues that failed on the first check. Next.js 16 required the middleware file to be renamed to `proxy.ts`, and ESLint flagged the way I was using `useRef` for dirty-state tracking and an effect for the saved status. I fixed these issues and reran the checks. After the fixes, the build, lint, typecheck, and tests passed. I did not get time to run a full screen-reader or Lighthouse audit.

---

## 14. Scalability — hundreds of companies

**What already holds:**

- Every table is keyed by `company_id`; adding tenants never widens a query
- Indexes cover slug lookup, owner lookup, and the three job facets
- Queries select explicit column lists, never `SELECT *`
- RLS means isolation doesn't depend on application code being bug-free
- Stateless rendering — Vercel scales horizontally with no session affinity

**What breaks first, and the fix:**

| Pressure                          | Symptom                          | Fix |
| --------------------------------- | -------------------------------- | --- |
| Traffic on popular careers pages  | Every view hits Postgres         | ISR/edge cache for anonymous requests, busted by `revalidatePath` on save |
| A company with 1,000+ jobs        | Large HTML, slow first paint     | Server-side filtering on the trigram + facet indexes, keyset pagination |
| Recruiter-hosted images           | Slow LCP, broken links           | Supabase Storage + `next/image` + CDN |
| Connection count at high concurrency | Postgres saturation           | Supabase connection pooler (PgBouncer) |
| Scrapers hitting public pages     | Cost and noise                   | Rate limiting at the edge |
| Bulk job import from an ATS       | Long request, partial writes     | Background jobs / queue, idempotent upserts |
| More companies, more incidents    | Blind debugging                  | Sentry + structured logs + Core Web Vitals |
| Real teams                        | One owner is not enough          | `company_members(company_id, user_id, role)` + updated RLS |

### The two problems I expect first

The first challenge I think would appear is **traffic on popular careers pages**. In the current implementation, the public page is dynamically rendered and reads company and job data from Supabase, so if a company receives a large amount of candidate traffic, repeated database requests could become a bottleneck. I would address this by adding caching or ISR/edge caching for anonymous careers pages, while making sure the cache is revalidated whenever a recruiter publishes changes.

The second challenge would be **companies with a very large number of jobs**. The current client-side filtering works well for the small dataset used in this prototype, but loading hundreds or thousands of jobs into the browser would increase the initial page size and make the approach less efficient. I would move the search and filters to server-side queries, use the existing indexes for title and filter fields, and add pagination so that only the jobs needed for the current view are returned.

---

## 15. Trade-offs

| Decision | Chose | Gave up |
| -------- | ----- | ------- |
| Client-side job filtering | Instant, zero round trips | Doesn't scale past ~hundreds of jobs |
| Plain-text + bullet convention | No editor, no sanitiser, no XSS surface | No rich formatting |
| Up/Down reorder | Keyboard + touch accessible for free | Less slick than drag-and-drop |
| Image URLs, not uploads | Zero storage setup | No optimization, links can rot |
| Whole-list section replace | Simple, atomic-feeling saves | Last-write-wins on concurrent edits |
| Server Actions, no REST layer | Less code, typed end to end | Harder to consume from a non-Next client |
| Dynamic rendering everywhere | Always fresh, session-aware | No CDN caching yet |
| Hand-written validation | One dependency fewer | Would use Zod as the surface grows |

### The trade-off I'd reverse first

The first trade-off I would reverse is **client-side job filtering**. I chose it for the prototype because the number of jobs is small and it gives an immediate response without extra database requests. I would change it when companies start having hundreds or thousands of jobs, because sending the entire job list to the browser would affect page size and performance. At that point, I would move the search and filters to server-side queries and add pagination, using the indexes already available in the database.

---

## 16. Future improvements

Roughly in the order you'd do them:

1. Job CRUD in the builder (or an ATS sync)
2. Supabase Storage uploads + `next/image`
3. ISR/edge caching for `/[slug]/careers`
4. Server-side job search and pagination
5. `company_members` for teams and roles
6. Run the existing Playwright suite in CI against a throwaway Supabase project
7. Section templates and a "reset to sample content" affordance
8. Analytics: views per page, filter usage, click-through to roles
9. Custom domains per company
10. Draft vs. published versions, so edits don't go live until approved

### My top three

My top three improvements would be **Job CRUD in the builder, Supabase Storage with `next/image`, and server-side job search with pagination**.

First, I would add **Job CRUD or ATS synchronization** because the recruiter currently depends on the existing job data. Giving recruiters a way to create, edit, and remove jobs would make the product more complete and useful in a real scenario.

Second, I would add **Supabase Storage and `next/image`** for company logos, banners, and other images. This would give better control over uploaded assets and improve image loading and optimization instead of depending on external image URLs.

Third, I would move to **server-side job search and pagination** once the number of jobs grows. The current client-side filtering is fine for the prototype, but loading a very large job list into the browser would not scale well. Server-side filtering would reduce the amount of data sent to the client and make the careers page more suitable for larger companies.
