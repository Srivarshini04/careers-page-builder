# AGENT_LOG — How I used AI on this assignment

> **⚠️ TEMPLATE — FILL THIS IN YOURSELF.**
> The assignment says this file must not be written by AI, and it's the one document
> where fabrication is most obvious to a reviewer. What follows is a **structure plus a
> factual list of what actually happened in this session**, so you have accurate
> anchors to write against. Do not submit the prompts below as if they were yours —
> replace them with what you actually typed, and add your own judgement calls.
> Delete this banner when you're done.

---

## Format for each entry

```
### [n]. <Task>
- **When:**
- **Tool:**
- **What I asked for:**
- **What I got back:**
- **What I accepted:**
- **What I changed or rejected, and why:**
- **What I learned:**
```

---

## ✍️ Overall summary (write last)

_Three or four sentences: where AI genuinely sped you up, where it slowed you down or
was wrong, and how you decided when to overrule it. The rubric scores "how you refined
or overruled their output" — the overruling is the interesting part, so lead with it._

---

## Factual timeline of this session — use as memory anchors

_These events actually happened, in this order. Use them to write real entries; add
what **you** decided at each point, which is the part no log can reconstruct for you._

1. **Read the brief.** The assignment PDF was parsed and the requirements extracted
   (recruiter/candidate flows, the four routes, sample-data link, submission checklist,
   evaluation rubric).
2. **Stack chosen:** Next.js 16 App Router + TypeScript + Tailwind v4 + Supabase + Vercel.
   `create-next-app` scaffold, then `@supabase/supabase-js`, `@supabase/ssr`,
   `lucide-react`, `server-only`.
3. **Types and data layer first** — `src/types/index.ts` mirroring the schema, then
   `lib/supabase/{client,server,env}.ts`, `lib/db/queries.ts`, `lib/db/authz.ts`.
4. **Design system primitives** — `Button`, `Field`/`Input`/`Textarea`/`Select`,
   `ColorPicker`, `RichText`, `Primitives`. Built before pages so nothing was styled ad hoc.
5. **Shared careers renderer** — `components/careers/CareersPage.tsx` written as one
   component used by the public page, `/preview`, and the builder's live pane.
6. **Jobs explorer** — filtering extracted into a pure `lib/utils/jobs.ts` so it could be
   unit-tested without React.
7. **Auth + routing** — `proxy.ts` (session refresh + route gate), `/login`, `/go`,
   `authorizeCompanyAccess`.
8. **Builder** — `EditorShell` holding draft state, with `BrandingPanel`, `HeroPanel`,
   `SectionManager`, `SharePanel`.
9. **Persistence** — `saveCareersPage` Server Action with server-side validation.
10. **SQL** — `supabase/schema.sql` (tables, constraints, indexes, `updated_at` triggers,
    RLS policies) and `supabase/seed.sql` (2 companies, 9 sections, 14 jobs).
11. **SEO** — `StructuredData` (Organization + JobPosting JSON-LD), dynamic metadata,
    `robots.ts`, `sitemap.ts`.
12. **Build fixes.** Three real problems surfaced and were fixed:
    - Next 16 deprecated the `middleware` file convention → renamed to `proxy.ts`
    - ESLint `react-hooks/refs`: a `useRef` was being read during render for dirty-state
      tracking → replaced with `useState`
    - ESLint `react-hooks/set-state-in-effect`: an effect was clearing the "Saved" badge →
      deleted the effect and derived the status instead
13. **Tests** — Vitest added; 36 unit tests across jobs filtering, content parsing and
    validation. `@types/node` had to be bumped to v22 for Vitest 5's peer range.
14. **Build, lint, typecheck, tests** all pass.

---

## Decisions where AI output was overruled or corrected

_These are real deviations from the first-pass suggestions. Confirm you agree with each —
if you don't, change the code, and say so in your entry. If you do agree, write **why**._

- **Schema deviation.** The suggested `companies` table had `about_content` and
  `life_content` columns *and* a `career_sections` table. That's two sources of truth for
  the same text, so the content columns were dropped and `career_sections` became
  authoritative. → _Do you agree? Say why._
- **Reorder mechanism.** Drag-and-drop was rejected in favour of Up/Down buttons —
  keyboard- and screen-reader-accessible with no gesture library, and ordering is just
  the array index. → _Was this the right call for a demo video?_
- **`revalidate = 300` removed.** ISR was tried on `/[slug]/careers`, but the Supabase
  client reads auth cookies, which forces dynamic rendering anyway. Rather than leave a
  misleading directive in the code, it was removed and caching moved to the Tech Spec's
  scaling section. → _Explain this one in the interview; it's a good answer._
- **Unowned companies are not editable.** The first version let any signed-in user edit a
  company whose `owner_id` was null. That was tightened to a strict `owner_id === user.id`.
- **Client-side filtering, knowingly.** Chosen for instant feedback at demo scale, with
  the trigram index and server-side path already prepared. → _Own this trade-off out loud._
- **No `next/image`.** Recruiter-supplied hosts can't be allow-listed ahead of time.
  Plain `<img>` now, Supabase Storage later.

---

## Prompts worth recording

_Replace with what you actually typed. The reviewer is looking for evidence of iteration,
so include the ones you had to refine — the first attempt **and** the follow-up that
fixed it, not just the polished final prompt._

```
Prompt 1: ✍️
Result:   ✍️
Refined:  ✍️
```

---

## ✍️ What I learned

_Genuinely the most valuable section. Candidates:_

- _Where AI was fastest (boilerplate, SQL, schema.org shapes) vs. slowest (visual
  judgement, deciding what to cut)._
- _Something the model got wrong that you caught — and how you caught it._
- _What you'd do differently next time you build under a 6-hour clock with AI._
