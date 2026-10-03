-- Expands the original prototype without deleting legacy attempts or questions.
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.quiz_mode as enum ('topic_practice', 'subject_quiz', 'subject_exam', 'general_exam');
create type public.session_status as enum ('active', 'completed', 'expired');

alter table public.subjects add column if not exists is_active boolean not null default true;

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  unique(subject_id, slug)
);

alter table public.lessons add column if not exists topic_id uuid references public.topics(id) on delete set null;
alter table public.lessons add column if not exists rule text not null default '';
alter table public.lessons add column if not exists example text not null default '';
alter table public.lessons add column if not exists status public.content_status not null default 'published';
create unique index if not exists lessons_one_per_topic on public.lessons(topic_id) where topic_id is not null;

create table public.passages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  language text not null check (language in ('eng', 'fil')),
  license_note text not null default 'Original application content',
  version integer not null default 1,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.source_artifacts (
  id uuid primary key default gen_random_uuid(),
  source_key text unique not null,
  title text not null,
  url text,
  local_checksum text,
  canonical_path text,
  duplicate_paths jsonb not null default '[]'::jsonb,
  format text,
  page_count integer,
  extraction_quality text,
  publication_date date,
  apparent_publisher text,
  reuse_status text not null check (reuse_status in ('coverage-reference','authoritative-reference','answer-key-only','stale-guidance','out-of-scope','unusable')),
  subjects text[] not null default '{}',
  topics text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.questions add column if not exists topic_id uuid references public.topics(id) on delete set null;
alter table public.questions add column if not exists passage_id uuid references public.passages(id) on delete set null;
alter table public.questions add column if not exists language text not null default 'eng' check (language in ('eng','fil'));
alter table public.questions add column if not exists version integer not null default 1;
alter table public.questions add column if not exists status public.content_status not null default 'draft';
alter table public.questions add column if not exists validation_rounds integer not null default 0 check (validation_rounds between 0 and 2);
alter table public.questions add column if not exists verified_at date;
alter table public.questions add column if not exists exam_tags text[] not null default '{}';
alter table public.questions add column if not exists content_key text;
create unique index if not exists questions_content_key_unique on public.questions(content_key) where content_key is not null;

create table public.question_sources (
  question_id uuid not null references public.questions(id) on delete cascade,
  source_artifact_id uuid not null references public.source_artifacts(id) on delete restrict,
  verification_note text not null,
  primary key(question_id, source_artifact_id)
);

create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mode public.quiz_mode not null,
  subject_id uuid references public.subjects(id),
  topic_id uuid references public.topics(id),
  status public.session_status not null default 'active',
  started_at timestamptz not null default now(),
  deadline timestamptz,
  completed_at timestamptz,
  attempt_id uuid references public.quiz_attempts(id),
  check (
    (mode = 'general_exam' and subject_id is null and topic_id is null) or
    (mode = 'topic_practice' and subject_id is not null and topic_id is not null) or
    (mode in ('subject_quiz','subject_exam') and subject_id is not null and topic_id is null)
  )
);

create table public.quiz_session_questions (
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  position integer not null,
  primary key(session_id, question_id),
  unique(session_id, position)
);

create table public.quiz_session_drafts (
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  selected_choice_id uuid references public.question_choices(id),
  locked_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(session_id, question_id)
);

alter table public.quiz_attempts alter column subject_id drop not null;
alter table public.quiz_attempts add column if not exists mode public.quiz_mode not null default 'topic_practice';
alter table public.quiz_attempts add column if not exists topic_id uuid references public.topics(id);
alter table public.quiz_attempts add column if not exists session_id uuid unique references public.quiz_sessions(id);

create table public.student_topic_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  questions_answered integer not null default 0,
  correct_answers integer not null default 0,
  exposure_count integer not null default 0,
  accuracy numeric generated always as (case when questions_answered = 0 then 0 else round(100.0 * correct_answers / questions_answered, 2) end) stored,
  last_activity timestamptz not null default now(),
  primary key(student_id, topic_id)
);

alter table public.topics enable row level security;
alter table public.passages enable row level security;
alter table public.source_artifacts enable row level security;
alter table public.question_sources enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_session_questions enable row level security;
alter table public.quiz_session_drafts enable row level security;
alter table public.student_topic_progress enable row level security;

create policy "published topics" on public.topics for select to authenticated using (true);
create policy "published passages" on public.passages for select to authenticated using (status = 'published' or public.is_admin());
create policy "authoritative sources" on public.source_artifacts for select to authenticated using (url is not null and reuse_status = 'authoritative-reference' or public.is_admin());
create policy "published question sources" on public.question_sources for select to authenticated using (public.is_admin());
create policy "own sessions" on public.quiz_sessions for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "own session questions" on public.quiz_session_questions for select to authenticated using (exists(select 1 from public.quiz_sessions s where s.id = session_id and (s.student_id = auth.uid() or public.is_admin())));
create policy "own drafts" on public.quiz_session_drafts for select to authenticated using (exists(select 1 from public.quiz_sessions s where s.id = session_id and (s.student_id = auth.uid() or public.is_admin())));
create policy "own topic progress" on public.student_topic_progress for select to authenticated using (student_id = auth.uid() or public.is_admin());

-- Answer keys are never readable through the data API. Correctness is revealed only by the RPCs below.
drop policy if exists "public questions" on public.questions;
drop policy if exists "public choices" on public.question_choices;
create policy "published questions metadata" on public.questions for select to authenticated using (public.is_admin());
create policy "choices admin only" on public.question_choices for select to authenticated using (public.is_admin());
revoke select on public.questions, public.question_choices from authenticated;

create or replace function public.quiz_mode_size(p_mode public.quiz_mode)
returns integer language sql immutable as $$
  select case p_mode when 'topic_practice' then 10 when 'subject_quiz' then 20 when 'subject_exam' then 50 else 100 end
$$;

create or replace function public.start_quiz_session(p_mode public.quiz_mode, p_subject_id uuid default null, p_topic_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_student uuid := auth.uid(); v_session uuid; v_needed integer := public.quiz_mode_size(p_mode); v_inserted integer;
  v_deadline timestamptz := case p_mode when 'subject_exam' then now() + interval '60 minutes' when 'general_exam' then now() + interval '120 minutes' else null end;
begin
  if v_student is null then raise exception 'Authentication required'; end if;
  if p_mode = 'topic_practice' and (p_subject_id is null or p_topic_id is null) then raise exception 'Topic practice requires subject and topic'; end if;
  if p_mode in ('subject_quiz','subject_exam') and p_subject_id is null then raise exception 'Subject mode requires subject'; end if;
  if p_mode = 'general_exam' and (p_subject_id is not null or p_topic_id is not null) then raise exception 'General exam does not take a subject or topic'; end if;
  insert into public.quiz_sessions(student_id, mode, subject_id, topic_id, deadline) values(v_student,p_mode,p_subject_id,p_topic_id,v_deadline) returning id into v_session;

  if p_mode = 'general_exam' then
    with allocation(slug, wanted, easy_wanted, medium_wanted, hard_wanted) as (values
      ('mathematics',20,6,10,4),('science',20,6,10,4),('english-language',15,5,7,3),
      ('filipino-language',15,5,7,3),('reading-comprehension',15,4,8,3),('mental-logical-reasoning',15,4,8,3)),
    ranked as (
      select q.id,q.difficulty,row_number() over(partition by s.slug,q.difficulty order by
        exists(select 1 from public.quiz_answers a join public.quiz_attempts qa on qa.id=a.attempt_id where qa.student_id=v_student and a.question_id=q.id),
        random()) n,a.easy_wanted,a.medium_wanted,a.hard_wanted
      from allocation a join public.subjects s on s.slug=a.slug join public.questions q on q.subject_id=s.id
      where q.status='published' and q.validation_rounds=2 and q.verified_at is not null
        and exists(select 1 from public.question_sources qs where qs.question_id=q.id)
        and (select count(*) from public.question_choices c where c.question_id=q.id)=4
        and (select count(*) from public.question_choices c where c.question_id=q.id and c.is_correct)=1
    )
    insert into public.quiz_session_questions(session_id,question_id,position)
    select v_session,id,row_number() over(order by random()) from ranked
    where (difficulty='easy' and n<=easy_wanted) or (difficulty='medium' and n<=medium_wanted) or (difficulty='hard' and n<=hard_wanted);
  else
    with quota(difficulty,wanted) as (values
      ('easy',case p_mode when 'topic_practice' then 3 when 'subject_quiz' then 6 else 15 end),
      ('medium',case p_mode when 'topic_practice' then 5 when 'subject_quiz' then 10 else 25 end),
      ('hard',case p_mode when 'topic_practice' then 2 when 'subject_quiz' then 4 else 10 end)),
    ranked as (
      select q.id,q.difficulty,row_number() over(partition by q.difficulty order by
        exists(select 1 from public.quiz_answers a join public.quiz_attempts qa on qa.id=a.attempt_id where qa.student_id=v_student and a.question_id=q.id),random()) n
      from public.questions q
      where q.status='published' and q.validation_rounds=2 and q.verified_at is not null and q.subject_id=p_subject_id and (p_topic_id is null or q.topic_id=p_topic_id)
        and exists(select 1 from public.question_sources qs where qs.question_id=q.id)
        and (select count(*) from public.question_choices c where c.question_id=q.id)=4
        and (select count(*) from public.question_choices c where c.question_id=q.id and c.is_correct)=1)
    insert into public.quiz_session_questions(session_id,question_id,position)
    select v_session,r.id,row_number() over(order by random()) from ranked r join quota q on q.difficulty=r.difficulty where r.n<=q.wanted;
  end if;
  select count(*) into v_inserted from public.quiz_session_questions where session_id=v_session;
  if v_inserted <> v_needed then raise exception 'Not enough validated questions for this mode: expected %, found %',v_needed,v_inserted; end if;
  return v_session;
end $$;

create or replace function public.get_quiz_session(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb;
begin
  if not exists(select 1 from public.quiz_sessions where id=p_session_id and student_id=auth.uid()) then raise exception 'Session not found'; end if;
  select jsonb_build_object(
    'id',s.id,'mode',s.mode,'subject_id',s.subject_id,'topic_id',s.topic_id,'status',s.status,'started_at',s.started_at,'deadline',s.deadline,
    'questions',coalesce((select jsonb_agg(jsonb_build_object(
      'id',q.id,'subject_id',q.subject_id,'topic_id',q.topic_id,'passage',p.body,'question_text',q.question_text,'difficulty',q.difficulty,
      'choices',(select jsonb_agg(jsonb_build_object('id',c.id,'question_id',c.question_id,'choice_text',c.choice_text,'sort_order',c.sort_order) order by c.sort_order) from public.question_choices c where c.question_id=q.id),
      'selected_choice_id',d.selected_choice_id,'locked_at',d.locked_at
    ) order by sq.position) from public.quiz_session_questions sq join public.questions q on q.id=sq.question_id left join public.passages p on p.id=q.passage_id left join public.quiz_session_drafts d on d.session_id=s.id and d.question_id=q.id where sq.session_id=s.id),'[]'::jsonb)
  ) into v_result from public.quiz_sessions s where s.id=p_session_id;
  return v_result;
end $$;

create or replace function public.save_quiz_draft(p_session_id uuid, p_question_id uuid, p_choice_id uuid, p_lock boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_mode public.quiz_mode; v_correct boolean;
begin
  select mode into v_mode from public.quiz_sessions where id=p_session_id and student_id=auth.uid() and status='active';
  if v_mode is null then raise exception 'Active session not found'; end if;
  if not exists(select 1 from public.quiz_session_questions where session_id=p_session_id and question_id=p_question_id) then raise exception 'Question is not in this session'; end if;
  if not exists(select 1 from public.question_choices where id=p_choice_id and question_id=p_question_id) then raise exception 'Choice does not belong to question'; end if;
  if exists(select 1 from public.quiz_session_drafts where session_id=p_session_id and question_id=p_question_id and locked_at is not null) then raise exception 'Answer is locked'; end if;
  insert into public.quiz_session_drafts(session_id,question_id,selected_choice_id,locked_at) values(p_session_id,p_question_id,p_choice_id,case when p_lock and v_mode='topic_practice' then now() end)
  on conflict(session_id,question_id) do update set selected_choice_id=excluded.selected_choice_id,locked_at=excluded.locked_at,updated_at=now();
  if p_lock and v_mode='topic_practice' then
    select is_correct into v_correct from public.question_choices where id=p_choice_id;
    return (select jsonb_build_object('is_correct',v_correct,'correct_choice_id',c.id,'explanation',q.explanation) from public.questions q join public.question_choices c on c.question_id=q.id and c.is_correct where q.id=p_question_id);
  end if;
  return jsonb_build_object('saved',true);
end $$;

create or replace function public.submit_quiz_session(p_session_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_session public.quiz_sessions%rowtype; v_attempt uuid; v_total integer; v_correct integer;
begin
  select * into v_session from public.quiz_sessions where id=p_session_id and student_id=auth.uid() for update;
  if not found then raise exception 'Session not found'; end if;
  if v_session.attempt_id is not null then return v_session.attempt_id; end if;
  select count(*) into v_total from public.quiz_session_questions where session_id=p_session_id;
  insert into public.quiz_attempts(student_id,subject_id,topic_id,mode,session_id,total_questions,completed_at)
  values(auth.uid(),v_session.subject_id,v_session.topic_id,v_session.mode,p_session_id,v_total,now()) returning id into v_attempt;
  insert into public.quiz_answers(attempt_id,question_id,selected_choice_id,is_correct)
  select v_attempt,sq.question_id,d.selected_choice_id,coalesce(c.is_correct,false)
  from public.quiz_session_questions sq left join public.quiz_session_drafts d on d.session_id=sq.session_id and d.question_id=sq.question_id left join public.question_choices c on c.id=d.selected_choice_id
  where sq.session_id=p_session_id;
  select count(*) into v_correct from public.quiz_answers where attempt_id=v_attempt and is_correct;
  update public.quiz_attempts set score=round(100.0*v_correct/v_total) where id=v_attempt;
  update public.quiz_sessions set status='completed',completed_at=now(),attempt_id=v_attempt where id=p_session_id;
  insert into public.student_progress(student_id,subject_id,questions_answered,correct_answers,accuracy,last_activity)
  select auth.uid(),q.subject_id,count(*),count(*) filter(where a.is_correct),round(100.0*count(*) filter(where a.is_correct)/count(*),2),now()
  from public.quiz_answers a join public.questions q on q.id=a.question_id where a.attempt_id=v_attempt group by q.subject_id
  on conflict(student_id,subject_id) do update set questions_answered=student_progress.questions_answered+excluded.questions_answered,correct_answers=student_progress.correct_answers+excluded.correct_answers,accuracy=round(100.0*(student_progress.correct_answers+excluded.correct_answers)/(student_progress.questions_answered+excluded.questions_answered),2),last_activity=now();
  insert into public.student_topic_progress(student_id,topic_id,questions_answered,correct_answers,exposure_count,last_activity)
  select auth.uid(),q.topic_id,count(*),count(*) filter(where a.is_correct),count(*),now() from public.quiz_answers a join public.questions q on q.id=a.question_id where a.attempt_id=v_attempt and q.topic_id is not null group by q.topic_id
  on conflict(student_id,topic_id) do update set questions_answered=student_topic_progress.questions_answered+excluded.questions_answered,correct_answers=student_topic_progress.correct_answers+excluded.correct_answers,exposure_count=student_topic_progress.exposure_count+excluded.exposure_count,last_activity=now();
  return v_attempt;
end $$;

create or replace function public.get_quiz_result(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb;
begin
  if not exists(select 1 from public.quiz_attempts where id=p_attempt_id and (student_id=auth.uid() or public.is_admin())) then raise exception 'Attempt not found'; end if;
  select jsonb_build_object('attempt',to_jsonb(qa),'questions',coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'subject_id',q.subject_id,'topic_id',q.topic_id,'question_text',q.question_text,'explanation',q.explanation,'difficulty',q.difficulty,
    'selected_choice_id',a.selected_choice_id,'is_correct',a.is_correct,
    'choices',(select jsonb_agg(jsonb_build_object('id',c.id,'question_id',c.question_id,'choice_text',c.choice_text,'sort_order',c.sort_order,'is_correct',c.is_correct) order by c.sort_order) from public.question_choices c where c.question_id=q.id)
  )),'[]'::jsonb)) into v_result from public.quiz_attempts qa join public.quiz_answers a on a.attempt_id=qa.id join public.questions q on q.id=a.question_id where qa.id=p_attempt_id group by qa.id;
  return v_result;
end $$;

create or replace function public.get_mistakes(p_subject_id uuid default null)
returns jsonb language sql security definer set search_path = public as $$
  with latest as (
    select distinct on (a.question_id) a.*, qa.subject_id
    from public.quiz_answers a join public.quiz_attempts qa on qa.id=a.attempt_id
    where qa.student_id=auth.uid() and not a.is_correct and (p_subject_id is null or qa.subject_id=p_subject_id)
    order by a.question_id,qa.completed_at desc nulls last
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'answer',to_jsonb(l),
    'question',jsonb_build_object('id',q.id,'subject_id',q.subject_id,'topic_id',q.topic_id,'question_text',q.question_text,'explanation',q.explanation,'difficulty',q.difficulty,'selected_choice_id',l.selected_choice_id,'is_correct',false,
      'choices',(select jsonb_agg(jsonb_build_object('id',c.id,'question_id',c.question_id,'choice_text',c.choice_text,'sort_order',c.sort_order,'is_correct',c.is_correct) order by c.sort_order) from public.question_choices c where c.question_id=q.id)))
  ),'[]'::jsonb) from latest l join public.questions q on q.id=l.question_id
$$;

revoke all on function public.start_quiz_session(public.quiz_mode,uuid,uuid), public.get_quiz_session(uuid), public.save_quiz_draft(uuid,uuid,uuid,boolean), public.submit_quiz_session(uuid), public.get_quiz_result(uuid), public.get_mistakes(uuid) from public;
grant execute on function public.start_quiz_session(public.quiz_mode,uuid,uuid), public.get_quiz_session(uuid), public.save_quiz_draft(uuid,uuid,uuid,boolean), public.submit_quiz_session(uuid), public.get_quiz_result(uuid), public.get_mistakes(uuid) to authenticated;
