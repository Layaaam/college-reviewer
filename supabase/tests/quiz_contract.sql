-- Run after migrations and seeds in a disposable database.
do $test$
begin
  if public.quiz_mode_size('topic_practice') <> 10 or public.quiz_mode_size('subject_quiz') <> 20 or
     public.quiz_mode_size('subject_exam') <> 50 or public.quiz_mode_size('general_exam') <> 100 then
    raise exception 'Quiz mode sizes do not match the public contract';
  end if;
  if has_table_privilege('authenticated', 'public.question_choices', 'select') then
    raise exception 'Authenticated clients must not read question choice answer keys directly';
  end if;
  if (select count(*) from public.questions where status='published') <> 1200 then
    raise exception 'Published bank must contain exactly 1,200 questions';
  end if;
  if (select count(distinct content_key) from public.questions where status='published') <> 1200 then
    raise exception 'Every published question must have a unique stable content key';
  end if;
  if exists (
    select 1 from public.questions q where q.status='published' and (
      q.validation_rounds <> 2 or q.verified_at is null or
      (select count(*) from public.question_choices c where c.question_id=q.id) <> 4 or
      (select count(*) from public.question_choices c where c.question_id=q.id and c.is_correct) <> 1 or
      not exists(select 1 from public.question_sources qs where qs.question_id=q.id)
    )
  ) then raise exception 'At least one published question failed the publication gate'; end if;
  if exists (
    select t.id from public.topics t left join public.questions q on q.topic_id=t.id and q.status='published'
    group by t.id having count(q.id) <> 20
  ) then raise exception 'Every topic must have exactly 20 published questions'; end if;
  if (select count(*) from public.lessons where status='published' and topic_id is not null) <> 60 then
    raise exception 'Published lesson catalog must contain exactly 60 topic lessons';
  end if;
  if exists (
    select 1 from public.lessons l where l.status='published' and l.topic_id is not null and (
      length(trim(l.overview)) < 120 or
      cardinality(l.objectives) < 4 or
      jsonb_array_length(l.concept_sections) < 3 or
      cardinality(l.method_steps) < 5 or
      jsonb_array_length(l.worked_examples) < 3 or
      cardinality(l.common_mistakes) < 4 or
      cardinality(l.exam_tips) < 4 or
      jsonb_array_length(l.quick_checks) < 3 or
      jsonb_array_length(l.source_links) < 1
    )
  ) then raise exception 'At least one published lesson failed the teach-first content gate'; end if;
end $test$;
