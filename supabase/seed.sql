-- =============================================================================
-- Careers Page Builder — sample data
--
-- PREREQUISITE: create TWO recruiters first — one per company, so that tenant
-- isolation is actually demonstrable rather than assumed.
--   Supabase Dashboard -> Authentication -> Users -> Add user  (tick "Auto Confirm User")
--     demo@careerbuilder.dev   / demo-recruiter-2024   -> owns Northwind Labs
--     lumen@careerbuilder.dev  / demo-recruiter-2024   -> owns Lumen Health
--
-- Then run this file in the SQL editor. It is idempotent: re-running resets the two
-- demo companies back to this exact state.
-- =============================================================================

do $$
declare
  demo_user_id  uuid;
  lumen_user_id uuid;
  northwind_id  uuid;
  lumen_id      uuid;
begin
  select id into demo_user_id  from auth.users where email = 'demo@careerbuilder.dev';
  select id into lumen_user_id from auth.users where email = 'lumen@careerbuilder.dev';

  if demo_user_id is null then
    raise exception
      'Recruiter demo@careerbuilder.dev not found. Create it in Authentication -> Users (auto-confirm), then re-run this script.';
  end if;

  if lumen_user_id is null then
    raise exception
      'Recruiter lumen@careerbuilder.dev not found. Create it in Authentication -> Users (auto-confirm), then re-run this script.';
  end if;

  -- ---------------------------------------------------------------------------
  -- Company 1 — Northwind Labs (the page used in the demo)
  -- ---------------------------------------------------------------------------
  insert into public.companies (
    owner_id, name, slug, tagline, logo_url,
    primary_color, secondary_color,
    hero_title, hero_description,
    banner_url, culture_video_url, website_url, location, published
  ) values (
    demo_user_id,
    'Northwind Labs',
    'northwind-labs',
    'Developer infrastructure, built in the open',
    null,
    '#4f46e5',
    '#111a2e',
    'Build the tools that other builders depend on.',
    'We are a 90-person team making deployment infrastructure that feels obvious. Small teams, real ownership, and software used by thousands of engineers every day.',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'https://example.com',
    'Bengaluru, India',
    true
  )
  on conflict (slug) do update set
    owner_id          = excluded.owner_id,
    name              = excluded.name,
    tagline           = excluded.tagline,
    logo_url          = excluded.logo_url,
    primary_color     = excluded.primary_color,
    secondary_color   = excluded.secondary_color,
    hero_title        = excluded.hero_title,
    hero_description  = excluded.hero_description,
    banner_url        = excluded.banner_url,
    culture_video_url = excluded.culture_video_url,
    website_url       = excluded.website_url,
    location          = excluded.location,
    published         = excluded.published
  returning id into northwind_id;

  -- ---------------------------------------------------------------------------
  -- Company 2 — Lumen Health (proves the page is data-driven, not hard-coded)
  -- ---------------------------------------------------------------------------
  insert into public.companies (
    owner_id, name, slug, tagline, logo_url,
    primary_color, secondary_color,
    hero_title, hero_description,
    banner_url, culture_video_url, website_url, location, published
  ) values (
    lumen_user_id,
    'Lumen Health',
    'lumen-health',
    'Care that reaches further',
    null,
    '#0f9d76',
    '#0a2e28',
    'Make good healthcare reachable for everyone.',
    'We build the software that connects clinics, labs and patients across 40 cities — so a diagnosis never waits on paperwork.',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    null,
    'https://example.com',
    'Hyderabad, India',
    true
  )
  on conflict (slug) do update set
    owner_id          = excluded.owner_id,
    name              = excluded.name,
    tagline           = excluded.tagline,
    primary_color     = excluded.primary_color,
    secondary_color   = excluded.secondary_color,
    hero_title        = excluded.hero_title,
    hero_description  = excluded.hero_description,
    banner_url        = excluded.banner_url,
    website_url       = excluded.website_url,
    location          = excluded.location,
    published         = excluded.published
  returning id into lumen_id;

  -- ---------------------------------------------------------------------------
  -- Reset child rows so the seed is repeatable
  -- ---------------------------------------------------------------------------
  delete from public.career_sections where company_id in (northwind_id, lumen_id);
  delete from public.jobs            where company_id in (northwind_id, lumen_id);

  -- ---------------------------------------------------------------------------
  -- Northwind Labs — content sections
  -- ---------------------------------------------------------------------------
  insert into public.career_sections (company_id, section_type, title, content, display_order, is_visible) values
  (northwind_id, 'about', 'About us',
   E'Northwind Labs started in 2019 with one stubborn belief: shipping software should not require a platform team of twenty people.\n\nToday our deployment engine runs in production for more than 4,000 teams, from two-person side projects to public companies. We are profitable, we are deliberately small, and we would rather ship one thing our users love than five they tolerate.\n\nEngineering, design and support sit in the same rooms and the same threads. If you have ever wanted your work to be visible the week you finish it, this is that kind of place.',
   0, true),

  (northwind_id, 'life', 'Life at Northwind',
   E'We work in eight-week cycles with a real cooldown week between them — no permanent sprint treadmill.\n\nMost decisions happen in writing, which means you can join a project on day three and read the whole story behind it. Meetings are the exception, not the calendar.\n\n- Deep work by default: Two no-meeting days every week, protected for everyone.\n- Written first: Proposals get read and commented on before anyone books a room.\n- Ship on your first week: Everyone lands a change in production during onboarding.\n- Support rotation: Every engineer talks to users one day a month. It changes what you build.',
   1, true),

  (northwind_id, 'values', 'What we believe',
   E'- Own the outcome: You are trusted with the whole problem, not a ticket. That includes deciding what not to build.\n- Default to clarity: Write it down, share it early, disagree in the open. Ambiguity is a tax everyone pays.\n- Boring where it counts: We take creative risks in the product and none at all in the database.\n- Users before roadmaps: A plan that survives contact with a real customer is worth more than a beautiful one.\n- Leave it better: Small, constant cleanup beats a heroic rewrite every time.',
   2, true),

  (northwind_id, 'benefits', 'Benefits and perks',
   E'- Ownership: Meaningful equity for every full-time employee, with a ten-year exercise window.\n- Health cover: Comprehensive insurance for you, your partner and your dependants.\n- Flexible location: Work from our Bengaluru studio, fully remote, or a mix — your call.\n- Learning budget: 1,50,000 a year for courses, conferences and books, no approval theatre.\n- Real time off: 30 days annual leave with a two-week minimum, plus a paid sabbatical at four years.\n- Home setup: A 1,00,000 budget for your desk, chair and screen, refreshed every three years.',
   3, true),

  (northwind_id, 'custom', 'How we hire',
   E'Four steps, about two weeks end to end, and we tell you where you stand after every one.\n\n- Intro call: 30 minutes with a recruiter about what you are looking for.\n- Craft interview: A paid take-home or a live session — your choice, both are 3 hours or less.\n- Team conversations: Two 45-minute chats with people you would work beside.\n- Offer: We share the range up front and never negotiate against another candidate.',
   4, true);

  -- ---------------------------------------------------------------------------
  -- Lumen Health — content sections (one hidden, to demo visibility control)
  -- ---------------------------------------------------------------------------
  insert into public.career_sections (company_id, section_type, title, content, display_order, is_visible) values
  (lumen_id, 'about', 'About Lumen',
   E'Lumen Health connects 1,200 clinics and 90 diagnostic labs onto one record, so a patient in a tier-3 town gets the same turnaround as one in a metro.\n\nWe are a team of 140 across Hyderabad and Pune, roughly half clinical and half engineering. The problems are unglamorous, deeply constrained, and they matter.',
   0, true),

  (lumen_id, 'values', 'Our values',
   E'- Patients first, always: If a decision is good for the business and bad for a patient, it is a bad decision.\n- Earn the trust: We handle sensitive records. Security and privacy are not a later phase.\n- Work the front line: Every quarter, everyone spends a day in a partner clinic.\n- Progress over polish: Shipping something useful this month beats something perfect next year.',
   1, true),

  (lumen_id, 'benefits', 'Benefits',
   E'- Family health cover: Insurance for you, your partner, children and parents.\n- Hybrid by design: Three days in the Hyderabad office, two wherever you work best.\n- Parental leave: Six months primary, twelve weeks secondary, fully paid.\n- Wellbeing stipend: A monthly allowance for therapy, fitness or whatever keeps you well.',
   2, true),

  (lumen_id, 'custom', 'Our 2026 roadmap',
   E'Internal draft — kept hidden until the announcement goes out. Toggle visibility in the builder to publish it.',
   3, false);

  -- ---------------------------------------------------------------------------
  -- Northwind Labs — 10 open roles
  -- ---------------------------------------------------------------------------
  insert into public.jobs (company_id, title, location, job_type, department, description) values
  (northwind_id, 'Senior Software Engineer, Platform', 'Bengaluru, India', 'Full Time', 'Engineering',
   E'You will own the scheduling layer that decides where and when customer workloads run — the part of Northwind that has to be right every single time.\n\nWhat you will do:\n- Design and ship changes to a distributed scheduler handling ~2M deployments a month\n- Cut p99 cold-start latency, which is our single most-requested improvement\n- Mentor two or three engineers and review the designs that touch your area\n\nWhat we look for: 5+ years building backend systems in Go, Rust or Java, comfort with distributed systems failure modes, and the judgement to know when a simpler design wins.'),

  (northwind_id, 'Frontend Engineer', 'Remote', 'Full Time', 'Engineering',
   E'Our dashboard is where engineers spend their day when something is on fire. You will make it fast, calm and legible.\n\nWhat you will do:\n- Build features across a large Next.js and TypeScript codebase\n- Own the component library and push our accessibility baseline past WCAG 2.1 AA\n- Work directly with design on real-time log and metric views\n\nWhat we look for: 3+ years with React and TypeScript, real care about performance budgets, and opinions about interaction detail.'),

  (northwind_id, 'Backend Engineer, Billing', 'Bengaluru, India', 'Full Time', 'Engineering',
   E'Billing touches every customer and forgives nothing. You will own metering, invoicing and the usage pipeline behind them.\n\nWhat you will do:\n- Build usage aggregation over a high-volume event stream in Postgres and Kafka\n- Design pricing primitives that let sales run experiments without a code change\n- Keep invoice accuracy at 100% — it is the only acceptable number\n\nWhat we look for: 3+ years in backend engineering, strong SQL and data-modelling instincts, and a healthy respect for idempotency.'),

  (northwind_id, 'Product Designer', 'Remote', 'Full Time', 'Design',
   E'You will be the third designer, paired with a product team from problem framing through to shipped detail.\n\nWhat you will do:\n- Run discovery with real users — our customers are engineers and they will tell you exactly what is wrong\n- Design end-to-end flows for deployment, observability and team management\n- Extend our design system and hold the line on quality across the product\n\nWhat we look for: A portfolio of shipped product work, comfort designing for technical users, and the ability to prototype in code or Figma at speed.'),

  (northwind_id, 'DevOps Engineer', 'Remote', 'Contract', 'Infrastructure',
   E'A six-month contract to harden our multi-region infrastructure ahead of an enterprise rollout, with a strong possibility of converting to full time.\n\nWhat you will do:\n- Extend Terraform modules across three new regions\n- Rebuild CI so a full test run finishes in under eight minutes\n- Tighten our incident tooling and on-call runbooks\n\nWhat we look for: Deep Kubernetes and Terraform experience, and a track record of leaving infrastructure calmer than you found it.'),

  (northwind_id, 'QA Engineer', 'Hyderabad, India', 'Full Time', 'Engineering',
   E'You will build the automated safety net that lets ninety engineers deploy on a Friday without flinching.\n\nWhat you will do:\n- Own our end-to-end suite in Playwright and keep it genuinely trustworthy\n- Build test data tooling that makes complex scenarios cheap to reproduce\n- Partner with engineers on testability before code is written, not after\n\nWhat we look for: 3+ years in test automation, strong debugging instincts, and low tolerance for flaky tests.'),

  (northwind_id, 'Product Manager, Developer Experience', 'Bengaluru, India', 'Full Time', 'Product',
   E'Own the first hour a developer spends with Northwind — signup, first deploy, first "oh, that was easy".\n\nWhat you will do:\n- Set the roadmap for onboarding, CLI and documentation\n- Turn support conversations and session recordings into a prioritised plan\n- Work shoulder to shoulder with design and engineering; we do not do handoffs\n\nWhat we look for: 4+ years in product for technical users, comfort reading code, and clear written thinking.'),

  (northwind_id, 'Data Analyst', 'Remote', 'Part Time', 'Data',
   E'A 20-hours-a-week role for someone who wants to shape how a profitable company reads its own numbers.\n\nWhat you will do:\n- Build and maintain the dbt models behind our core metrics\n- Answer questions about retention, expansion and usage — and make the next person able to answer them alone\n- Keep our self-serve dashboards honest\n\nWhat we look for: Fluent SQL, experience with dbt or similar, and the discipline to define a metric once and defend it.'),

  (northwind_id, 'Developer Advocate', 'Berlin, Germany', 'Full Time', 'Marketing',
   E'Represent Northwind where developers actually are — in issue threads, at meetups, and in documentation people finish reading.\n\nWhat you will do:\n- Write technical posts and sample applications that stand on their own\n- Speak at 6 to 8 events a year across Europe\n- Bring what you hear back into the roadmap with receipts\n\nWhat we look for: Real engineering background, a public body of writing or talks, and genuine enthusiasm for teaching.'),

  (northwind_id, 'Software Engineering Intern', 'Bengaluru, India', 'Internship', 'Engineering',
   E'A paid six-month internship for final-year students or recent graduates, with a mentor and a real project.\n\nWhat you will do:\n- Ship production code from your second week, reviewed by senior engineers\n- Own a small feature end to end, including its rollout\n- Join design reviews and retros as a full participant\n\nWhat we look for: Solid programming fundamentals, curiosity, and evidence you have built something because you wanted it to exist.');

  -- ---------------------------------------------------------------------------
  -- Lumen Health — 4 open roles
  -- ---------------------------------------------------------------------------
  insert into public.jobs (company_id, title, location, job_type, department, description) values
  (lumen_id, 'Senior Backend Engineer', 'Hyderabad, India', 'Full Time', 'Engineering',
   E'Own the records pipeline that moves lab results between 90 partner labs and 1,200 clinics, under strict privacy constraints.\n\nWhat you will do:\n- Design ingestion for a dozen incompatible lab formats without losing fidelity\n- Build audit trails that satisfy both clinicians and regulators\n- Keep end-to-end result delivery under four minutes\n\nWhat we look for: 5+ years in backend engineering, strong Postgres, and care about correctness over cleverness.'),

  (lumen_id, 'UI/UX Designer', 'Hyderabad, India', 'Full Time', 'Design',
   E'Design software used by nurses and lab technicians on shared machines, often in a hurry.\n\nWhat you will do:\n- Run field research in partner clinics — the real constraints are never in the brief\n- Design flows that survive low bandwidth, small screens and interruptions\n- Own accessibility standards across our clinical tools\n\nWhat we look for: 3+ years designing complex operational software, and patience for the messy details.'),

  (lumen_id, 'Marketing Specialist', 'Remote', 'Full Time', 'Marketing',
   E'Tell the Lumen story to clinics deciding whether to trust us with their patients.\n\nWhat you will do:\n- Own case studies, partner communications and the content calendar\n- Run campaigns targeted at clinic administrators, not consumers\n- Build the material our field team actually uses\n\nWhat we look for: 3+ years in B2B marketing, excellent writing, and comfort in a regulated category.'),

  (lumen_id, 'Clinical Operations Associate', 'Pune, India', 'Contract', 'Operations',
   E'A twelve-month contract supporting the onboarding of new diagnostic partners across western India.\n\nWhat you will do:\n- Run onboarding for 5 to 8 new lab partners each quarter\n- Train clinic staff and stay their first point of contact\n- Feed recurring friction back to the product team\n\nWhat we look for: A clinical or healthcare operations background, and willingness to travel roughly a week a month.');

  raise notice 'Seed complete. Northwind Labs: % (demo@) | Lumen Health: % (lumen@)', northwind_id, lumen_id;
end;
$$;
