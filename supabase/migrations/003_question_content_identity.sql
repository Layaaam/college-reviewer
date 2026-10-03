-- Corrects seed identity for questions that intentionally share a stem but use different passages or parameters.
alter table public.questions add column if not exists content_key text;
create unique index if not exists questions_content_key_unique
  on public.questions(content_key)
  where content_key is not null;
