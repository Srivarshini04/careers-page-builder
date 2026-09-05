-- =============================================================================
-- Careers Page Builder — schema
-- Run this first in the Supabase SQL editor, then run seed.sql.
--
-- Multi-tenancy model: every row belongs to exactly one company, and every company
-- has exactly one owner (auth.users). Row Level Security is the enforcement boundary —
-- the application never uses a service-role key, so a recruiter physically cannot read
-- or write another company's rows even if the app code has a bug.
-- =============================================================================

create extension if not exists pgcrypto;
-- Trigram index support for job-title search. Safe to skip if unavailable.
create extension if not exists pg_trgm;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.companies (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users (id) on delete set null,
  name              text        not null check (char_length(name) between 1 and 80),
  slug              text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tagline           text,
  logo_url          text,
  primary_color     text        not null default '#4f46e5' check (primary_color ~* '^#[0-9a-f]{6}$'),
  secondary_color   text        not null default '#0f172a' check (secondary_color ~* '^#[0-9a-f]{6}$'),
  hero_title        text        not null default 'Build what matters, with people who care.',
  hero_description  text,
  banner_url        text,
  culture_video_url text,
  website_url       text,
  location          text,
  published         boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.companies is
  'One tenant. Branding + hero live here; long-form content lives in career_sections.';

create table if not exists public.career_sections (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid        not null references public.companies (id) on delete cascade,
  section_type  text        not null default 'custom'
                            check (section_type in ('about', 'life', 'values', 'benefits', 'custom')),
  title         text        not null check (char_length(title) between 1 and 60),
  content       text        not null default '',
  display_order integer     not null default 0,
  is_visible    boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.career_sections is
  'Ordered content blocks. display_order is dense and rewritten from array position on save.';

create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid        not null references public.companies (id) on delete cascade,
  title        text        not null check (char_length(title) between 1 and 120),
  location     text        not null default 'Remote',
  job_type     text        not null default 'Full Time'
                           check (job_type in ('Full Time', 'Part Time', 'Contract', 'Internship')),
  department   text,
  description  text,
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- Every candidate-facing query filters by company first, then by a facet.
-- -----------------------------------------------------------------------------

create index if not exists companies_owner_id_idx        on public.companies (owner_id);
create index if not exists companies_published_idx       on public.companies (published) where published;

create index if not exists career_sections_company_order_idx
  on public.career_sections (company_id, display_order);

create index if not exists jobs_company_published_idx    on public.jobs (company_id, is_published);
create index if not exists jobs_company_location_idx     on public.jobs (company_id, location);
create index if not exists jobs_company_job_type_idx     on public.jobs (company_id, job_type);
-- Substring search on job title without a full scan, for when filtering moves server-side.
create index if not exists jobs_title_trgm_idx           on public.jobs using gin (title gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_touch_updated_at on public.companies;
create trigger companies_touch_updated_at
  before update on public.companies
  for each row execute function public.touch_updated_at();

drop trigger if exists career_sections_touch_updated_at on public.career_sections;
create trigger career_sections_touch_updated_at
  before update on public.career_sections
  for each row execute function public.touch_updated_at();

drop trigger if exists jobs_touch_updated_at on public.jobs;
create trigger jobs_touch_updated_at
  before update on public.jobs
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.companies       enable row level security;
alter table public.career_sections enable row level security;
alter table public.jobs            enable row level security;

-- Helpers keep the child-table policies readable and consistent.
create or replace function public.is_company_owner(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = target and c.owner_id = auth.uid()
  );
$$;

create or replace function public.is_company_readable(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies c
    where c.id = target and (c.published or c.owner_id = auth.uid())
  );
$$;

-- companies -------------------------------------------------------------------
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select
  using (published or owner_id = auth.uid());

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- No delete policy: companies can only be removed by an admin with the service role.

-- career_sections -------------------------------------------------------------
-- A hidden section is a private draft. The app already filters on is_visible, but the
-- anon key is public, so the policy has to enforce it too — otherwise anyone could read
-- unreleased content straight from the REST API.
drop policy if exists career_sections_select on public.career_sections;
create policy career_sections_select on public.career_sections
  for select
  using (
    public.is_company_readable(company_id)
    and (is_visible or public.is_company_owner(company_id))
  );

drop policy if exists career_sections_write on public.career_sections;
create policy career_sections_write on public.career_sections
  for all to authenticated
  using (public.is_company_owner(company_id))
  with check (public.is_company_owner(company_id));

-- jobs ------------------------------------------------------------------------
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select
  using (
    public.is_company_readable(company_id)
    and (is_published or public.is_company_owner(company_id))
  );

drop policy if exists jobs_write on public.jobs;
create policy jobs_write on public.jobs
  for all to authenticated
  using (public.is_company_owner(company_id))
  with check (public.is_company_owner(company_id));
