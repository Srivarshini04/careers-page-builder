-- Migration 003 — an optional image per content section.
--
-- The editorial (two-column) sections put the heading in a narrow left column and the
-- prose on the right, which left a tall empty gap under short headings. Rather than
-- hard-coding decoration, recruiters get an image slot they control — the same choice
-- already made for the logo and banner.
--
-- Already folded into schema.sql; run this only on a database created before it.

alter table public.career_sections
  add column if not exists image_url text;

comment on column public.career_sections.image_url is
  'Optional supporting image. Rendered beside the heading in editorial sections.';
