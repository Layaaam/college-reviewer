-- Structured lesson content for teach-first review pages.
alter table public.lessons add column if not exists overview text not null default '';
alter table public.lessons add column if not exists objectives text[] not null default '{}';
alter table public.lessons add column if not exists concept_sections jsonb not null default '[]'::jsonb;
alter table public.lessons add column if not exists method_steps text[] not null default '{}';
alter table public.lessons add column if not exists worked_examples jsonb not null default '[]'::jsonb;
alter table public.lessons add column if not exists common_mistakes text[] not null default '{}';
alter table public.lessons add column if not exists exam_tips text[] not null default '{}';
alter table public.lessons add column if not exists quick_checks jsonb not null default '[]'::jsonb;
alter table public.lessons add column if not exists source_links jsonb not null default '[]'::jsonb;
alter table public.lessons add column if not exists estimated_minutes integer not null default 15 check (estimated_minutes between 5 and 90);

-- Preserve legacy rows for historical references but remove them from the student catalog.
update public.lessons set status='archived' where topic_id is null;
