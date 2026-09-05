-- Migration 002 — one recruiter per company.
--
-- The prototype originally gave a single demo user ownership of both companies, which
-- made it impossible to demonstrate that tenants are actually isolated: RLS was never
-- exercised because the one account legitimately owned everything.
--
-- Each company now has its own owner, so signing in as one recruiter and opening the
-- other company's builder is genuinely blocked — by the database, not just the UI.
--
-- PREREQUISITE: create the second recruiter first
--   Supabase Dashboard -> Authentication -> Users -> Add user
--     Email:    lumen@careerbuilder.dev
--     Password: demo-recruiter-2024
--     Tick "Auto Confirm User"
--
-- Then run this file. It is idempotent.

do $$
declare
  northwind_owner uuid;
  lumen_owner     uuid;
begin
  select id into northwind_owner from auth.users where email = 'demo@careerbuilder.dev';
  select id into lumen_owner     from auth.users where email = 'lumen@careerbuilder.dev';

  if northwind_owner is null then
    raise exception
      'Missing recruiter demo@careerbuilder.dev. Create it in Authentication -> Users (auto-confirm), then re-run.';
  end if;

  if lumen_owner is null then
    raise exception
      'Missing recruiter lumen@careerbuilder.dev. Create it in Authentication -> Users (auto-confirm, password demo-recruiter-2024), then re-run.';
  end if;

  update public.companies set owner_id = northwind_owner where slug = 'northwind-labs';
  update public.companies set owner_id = lumen_owner     where slug = 'lumen-health';

  raise notice 'Northwind Labs -> % | Lumen Health -> %', northwind_owner, lumen_owner;
end;
$$;
