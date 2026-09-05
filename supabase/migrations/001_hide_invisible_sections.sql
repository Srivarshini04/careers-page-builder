-- Migration 001 — hidden sections must not be readable by anonymous visitors.
--
-- Found while probing RLS with the public anon key: the original select policy exposed
-- rows with is_visible = false over the REST API, even though the app filtered them out
-- of the rendered page. A hidden section is an unreleased draft, so the database — not
-- just the query — has to keep it private.
--
-- Already folded into schema.sql; run this only on a database created before that change.

drop policy if exists career_sections_select on public.career_sections;
create policy career_sections_select on public.career_sections
  for select
  using (
    public.is_company_readable(company_id)
    and (is_visible or public.is_company_owner(company_id))
  );
