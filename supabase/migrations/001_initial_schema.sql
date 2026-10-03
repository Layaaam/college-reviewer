create type public.user_role as enum ('student', 'admin');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text not null, full_name text not null default '', role public.user_role not null default 'student', created_at timestamptz not null default now());
create table public.subjects (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, description text not null default '', sort_order int not null default 0);
create table public.lessons (id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade, title text not null, content text not null, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.questions (id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade, lesson_id uuid references public.lessons(id) on delete set null, question_text text not null, explanation text not null, difficulty text not null check (difficulty in ('easy','medium','hard')), created_at timestamptz not null default now());
create table public.question_choices (id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade, choice_text text not null, is_correct boolean not null default false, sort_order int not null default 0);
create table public.quiz_attempts (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade, subject_id uuid not null references public.subjects(id), score int not null default 0, total_questions int not null, started_at timestamptz not null default now(), completed_at timestamptz);
create table public.quiz_answers (id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.quiz_attempts(id) on delete cascade, question_id uuid not null references public.questions(id), selected_choice_id uuid references public.question_choices(id), is_correct boolean not null default false);
create table public.student_progress (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade, subject_id uuid not null references public.subjects(id), questions_answered int not null default 0, correct_answers int not null default 0, accuracy numeric not null default 0, last_activity timestamptz not null default now(), unique(student_id, subject_id));
alter table public.profiles enable row level security; alter table public.subjects enable row level security; alter table public.lessons enable row level security; alter table public.questions enable row level security; alter table public.question_choices enable row level security; alter table public.quiz_attempts enable row level security; alter table public.quiz_answers enable row level security; alter table public.student_progress enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;
create policy "public learning content" on public.subjects for select to authenticated using (true); create policy "public lessons" on public.lessons for select to authenticated using (true); create policy "public questions" on public.questions for select to authenticated using (true); create policy "public choices" on public.question_choices for select to authenticated using (true);
create policy "own profile or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "own attempts read" on public.quiz_attempts for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "own answers read" on public.quiz_answers for select to authenticated using (exists(select 1 from public.quiz_attempts a where a.id = attempt_id and (a.student_id = auth.uid() or public.is_admin())));
create policy "own progress read" on public.student_progress for select to authenticated using (student_id = auth.uid() or public.is_admin());

-- Profiles are provisioned by Auth; users cannot choose their own role.
create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''), 'student');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- The database calculates correctness, score, and progress in one transaction.
-- Clients cannot insert attempts or answers directly under RLS.
create or replace function public.submit_quiz(p_subject_id uuid, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_attempt_id uuid;
  v_question_count integer;
  v_correct integer;
  v_answer jsonb;
  v_question_id uuid;
  v_choice_id uuid;
  v_is_correct boolean;
begin
  if v_student_id is null or not exists (
    select 1 from public.profiles where id = v_student_id and role = 'student'
  ) then
    raise exception 'Student authentication required';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers) <> 10 then
    raise exception 'Exactly 10 answer records are required';
  end if;
  select count(*) into v_question_count from public.questions where subject_id = p_subject_id;
  if v_question_count < 10 then
    raise exception 'This subject does not have enough questions';
  end if;
  if (select count(distinct item->>'question_id') from jsonb_array_elements(p_answers) item) <> 10 then
    raise exception 'Question IDs must be unique';
  end if;

  insert into public.quiz_attempts (student_id, subject_id, score, total_questions, completed_at)
  values (v_student_id, p_subject_id, 0, 10, now()) returning id into v_attempt_id;

  v_correct := 0;
  for v_answer in select value from jsonb_array_elements(p_answers) loop
    v_question_id := (v_answer->>'question_id')::uuid;
    v_choice_id := nullif(v_answer->>'selected_choice_id', '')::uuid;
    if not exists (select 1 from public.questions where id = v_question_id and subject_id = p_subject_id) then
      raise exception 'Question does not belong to this subject';
    end if;
    if v_choice_id is not null and not exists (
      select 1 from public.question_choices where id = v_choice_id and question_id = v_question_id
    ) then
      raise exception 'Choice does not belong to this question';
    end if;
    select coalesce(is_correct, false) into v_is_correct
    from public.question_choices where id = v_choice_id;
    v_is_correct := coalesce(v_is_correct, false);
    if v_is_correct then v_correct := v_correct + 1; end if;
    insert into public.quiz_answers (attempt_id, question_id, selected_choice_id, is_correct)
    values (v_attempt_id, v_question_id, v_choice_id, v_is_correct);
  end loop;

  update public.quiz_attempts set score = v_correct * 10 where id = v_attempt_id;
  insert into public.student_progress
    (student_id, subject_id, questions_answered, correct_answers, accuracy, last_activity)
  values (v_student_id, p_subject_id, 10, v_correct, v_correct * 10, now())
  on conflict (student_id, subject_id) do update
  set questions_answered = student_progress.questions_answered + 10,
      correct_answers = student_progress.correct_answers + v_correct,
      accuracy = round(100.0 * (student_progress.correct_answers + v_correct) /
        (student_progress.questions_answered + 10), 2),
      last_activity = now();
  return v_attempt_id;
end;
$$;
revoke all on function public.submit_quiz(uuid, jsonb) from public;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
