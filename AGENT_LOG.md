# AGENT_LOG — How I used AI on this assignment

## 1. Understanding the assignment

I started by using AI to break down the assignment brief into smaller requirements. It helped me identify the recruiter flow, candidate flow, required routes, branding and section editing, job search and filtering, SEO, accessibility, testing, and deployment requirements. I used this breakdown as a starting point, but kept the assignment brief as the final reference for deciding what actually needed to be built.

---

## 2. Choosing the technology stack

For the initial technical planning, I used AI to compare practical options for building the project within the limited time. The final stack I used was Next.js 16 with the App Router and TypeScript, Tailwind CSS, Supabase, and Vercel. I chose this because it gave me a good combination of server-rendered pages, authentication, database support, responsive styling, and simple deployment without having to build and configure many separate services.

---

## 3. Setting up the data layer

I used AI to help structure the TypeScript types and Supabase data-access layer around companies, career sections, and jobs. It helped create the initial Supabase utilities, database queries, and authorization helpers. While reviewing the suggested database design, I noticed that storing `about_content` and `life_content` in the `companies` table while also having a `career_sections` table would create two sources of truth. I removed the duplicate content fields and made `career_sections` the authoritative place for the page sections.

---

## 4. Building reusable UI components

I used AI to speed up the creation of reusable UI primitives such as buttons, fields, inputs, textareas, selects, color pickers, and rich text components. I accepted this structure because it helped keep the UI consistent and reduced repeated styling. I wanted to have these basic components in place before building the main pages instead of styling every page separately.

---

## 5. Creating the shared Careers Page

One of the architectural decisions I kept was using a shared `CareersPage` component for the public careers page, preview page, and the live preview inside the builder. This was suggested during the implementation and made sense to me because the recruiter should see almost the same page that candidates eventually see. Having one renderer also reduces the chance of the preview and published page becoming inconsistent.

---

## 6. Building the jobs explorer

I used AI to implement the job search and filtering functionality and then separated the filtering logic into `lib/utils/jobs.ts`. I kept this as pure logic instead of putting everything inside React components because it made the behavior easier to understand and test. For this assignment I intentionally kept filtering on the client because the demo contains a small number of jobs and this provides instant feedback. For a larger production dataset, I would move this to server-side search and pagination.

---

## 7. Authentication and authorization

AI helped me set up Supabase authentication, session handling, protected recruiter routes, and company authorization. During the implementation I found that the first approach allowed a signed-in user to edit a company when its `owner_id` was null. I changed this so that company access requires `owner_id === user.id`. I kept this stricter approach because being authenticated should not automatically give a user access to every company in a multi-tenant application.

---

## 8. Building the recruiter editor

I used AI to help structure the recruiter builder around an `EditorShell` with separate panels for branding, hero content, sections, and sharing. The builder keeps changes as a local draft and allows the recruiter to explicitly save them. One decision I changed was the section reordering interaction. Instead of using drag-and-drop, I used Up/Down buttons because they were simpler, keyboard accessible, and did not require an additional gesture library. For this assignment, I felt that was a better trade-off than spending extra time implementing drag-and-drop.

---

## 9. Saving changes securely

I used AI to connect the editor to Supabase through a `saveCareersPage` Server Action. The important part for me was making sure that validation and authorization were not handled only on the client. The save operation checks the authenticated user and the company they are allowed to manage before writing the changes. This gave me a clearer separation between the editor UI and the actual persistence layer.

---

## 10. Database schema, RLS and seed data

AI helped generate the SQL for the database tables, relationships, constraints, indexes, update triggers, and Row Level Security policies. I reviewed the schema instead of accepting it directly and made the decision to keep career section content only in `career_sections`. I also used seed data for two companies so that the recruiter and candidate flows could be demonstrated without manually creating everything during the demo. RLS was important because I wanted tenant isolation to be enforced at the database level as well as in the application.

---

## 11. SEO implementation

After the main page functionality was working, I used AI to help implement the SEO requirements from the assignment. This included dynamic metadata, canonical information, Open Graph and Twitter metadata, `robots.ts`, `sitemap.ts`, and JSON-LD structured data for the organization and jobs. I kept these features because SEO and crawlable careers pages were explicit requirements, rather than treating them as optional additions.

---

## 12. Fixing issues during development

During development, I relied on the actual build and lint output to identify problems rather than assuming the generated code was correct. Three issues that required changes were related to Next 16's change from the middleware convention to `proxy.ts`, an ESLint rule about reading a `useRef` during render, and another React hooks rule related to setting state inside an effect. I changed the middleware file to `proxy.ts`, replaced the render-time ref usage with state, and removed the unnecessary effect by deriving the status instead. This was one of the areas where AI was useful for debugging, but I still used the actual compiler and linter messages to decide what needed to change.

---

## 13. Testing

Once the main functionality was implemented, I added unit tests for the reusable job filtering, content parsing, and validation logic. I kept these tests separate from the React components so that the core behavior could be tested without rendering the UI. I also used the test results together with the build, lint, and typecheck results to verify the implementation. This helped me understand that separating pure logic from UI code makes testing simpler and makes bugs easier to isolate.

---

## 14. Final verification

Before considering the project complete, I ran the build, lint, typecheck, and test commands and checked that they passed. I also manually went through the main recruiter and candidate flows because passing automated checks does not guarantee that the actual user experience is correct. I checked the builder, saving and reloading changes, preview/public pages, search and filters, and responsive behavior. This final step helped me catch issues that would not necessarily be visible from the test output alone.

---

# Prompts worth recording

### Prompt 1 — Initial planning

I asked AI to break down the Careers Page Builder assignment into a practical implementation plan and suggest a stack that could be completed within the available time. I specifically wanted the plan to cover authentication, company branding, editable sections, preview, persistence, public careers pages, job filtering, SEO, accessibility, testing, and deployment.

The first result gave me the overall architecture and task breakdown. I then refined the approach by asking AI to focus on implementing the project in smaller stages rather than trying to build every feature at once.

---

### Prompt 2 — Database design

I asked AI to design a Supabase schema for companies, career sections, and jobs with ownership, relationships, indexes, and RLS policies.

The first design contained company-level content fields as well as a `career_sections` table. I reviewed that and decided that keeping both would duplicate the same content. I removed the duplicate fields and kept `career_sections` as the single source of truth.

---

### Prompt 3 — Recruiter builder

I asked AI to build the recruiter editor with branding controls, hero editing, section visibility and ordering, saving, preview, and sharing.

The resulting structure used an `EditorShell` and separate editor panels. I kept that architecture but changed the section ordering interaction from drag-and-drop to Up/Down buttons because it was simpler and more accessible for the scope of the assignment.

---

### Prompt 4 — Debugging

When build and lint errors appeared, I gave the actual error messages to AI and asked it to identify the cause and suggest the smallest fix without changing the intended behavior.

This helped with the Next 16 `proxy.ts` change and the React hooks lint issues. I still checked the resulting changes by running the commands again rather than assuming the suggested fix was correct.

---

# Overall summary

The biggest benefit of AI for me was reducing the time spent on boilerplate, SQL, component setup, debugging, and repetitive implementation work. I did not accept the first solution automatically; I changed the schema when I noticed duplicate sources of truth, tightened company authorization when the first version was too permissive, and replaced drag-and-drop with simpler accessible controls. I also removed the attempted ISR configuration once I understood that the cookie-based Supabase reads were forcing dynamic rendering anyway, rather than leaving a directive in the code that implied the page was being cached when it was not. I used the assignment requirements, compiler/linter output, tests, and my own judgement to decide when to keep or overrule AI suggestions.

---

# What I learned

AI was fastest for boilerplate, SQL, reusable components, validation, structured data, and debugging. It was slower when the task required product judgement, especially deciding what features were worth implementing within the time limit and which interactions were actually useful for the user.

One important thing I learned was that AI-generated architecture still needs to be reviewed carefully. The duplicate content fields in the first schema design were a good example because the code could technically work but the data model would have been unnecessarily confusing. I also learned that framework behavior should be verified instead of assuming that a suggested optimization such as ISR will work with the way the application is actually fetching data.

If I had to build another project under a six-hour deadline, I would work in smaller verified stages and run the build and tests more frequently. I would first get the core flow working, then add the important requirements such as SEO, accessibility, and testing, and only then spend time on optional improvements. This would make it easier to identify problems early and leave enough time for final verification and deployment.