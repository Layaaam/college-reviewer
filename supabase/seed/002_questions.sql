-- Generated from questions.json by npm run seed:questions:sql.
-- Run after 001_subjects_lessons.sql. The transaction rolls back on error.
begin;
do $seed$
declare
  v_subject_id uuid;
  v_question_id uuid;
begin
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is 12 × 8?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is 12 × 8?', '12 multiplied by 8 equals 96.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '86', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '86');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '96', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '96');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '108', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '108');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '112', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '112');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Solve for x: 3x + 5 = 20.' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Solve for x: 3x + 5 = 20.', 'Subtract 5 to get 3x = 15, then divide by 3 to get x = 5.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '3', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '3');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '5', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '5');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '15', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '15');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the slope of y = 2x − 7?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the slope of y = 2x − 7?', 'In y = mx + b, m is the slope; here m = 2.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '−7', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '−7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '2', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '2');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '−2', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '−2');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the area of a triangle with base 10 and height 6?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the area of a triangle with base 10 and height 6?', 'Area is one-half times base times height: 1/2 × 10 × 6 = 30.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '16', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '16');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '30', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '30');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '36', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '36');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '60', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '60');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which is equivalent to 2(x + 4)?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which is equivalent to 2(x + 4)?', 'Distribute 2 to both terms: 2x + 2(4) = 2x + 8.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '2x + 4', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '2x + 4');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '2x + 6', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '2x + 6');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '2x + 8', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '2x + 8');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'x + 8', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'x + 8');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the mean of 4, 6, 8, and 10?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the mean of 4, 6, 8, and 10?', 'Add the values to get 28 and divide by 4, giving 7.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '6', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '6');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '8', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '8');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '28', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '28');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'If a fair die is rolled, what is the probability of rolling an even number?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'If a fair die is rolled, what is the probability of rolling an even number?', 'Three of six outcomes are even, so the probability is 3/6 = 1/2.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '1/6', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '1/6');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '1/3', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '1/3');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '1/2', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '1/2');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '2/3', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '2/3');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the positive solution of x² = 49?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the positive solution of x² = 49?', 'The positive square root of 49 is 7.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '−7', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '−7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '0', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '0');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '49', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '49');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which expression represents a 20% increase of n?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which expression represents a 20% increase of n?', 'A 20% increase keeps 100% and adds 20%, or 120% = 1.2 of n.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '0.2n', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '0.2n');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '1.2n', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '1.2n');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '20n', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '20n');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'n + 20', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'n + 20');
  select id into strict v_subject_id from public.subjects where slug = 'mathematics';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the next term in 3, 6, 12, 24, ...?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the next term in 3, 6, 12, 24, ...?', 'Each term is doubled, so 24 × 2 = 48.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '30', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '30');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '36', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '36');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '48', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '48');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '72', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '72');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which word is closest in meaning to diligent?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which word is closest in meaning to diligent?', 'Diligent describes someone who consistently works carefully and with effort.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Careless', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Careless');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Hardworking', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Hardworking');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Noisy', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Noisy');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Uncertain', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Uncertain');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Choose the correctly punctuated sentence.' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Choose the correctly punctuated sentence.', 'An introductory phrase is followed by a comma when it comes before the main clause.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'After class we studied.', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'After class we studied.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'After class, we studied.', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'After class, we studied.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'After, class we studied.', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'After, class we studied.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'After class we, studied.', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'After class we, studied.');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which sentence uses its subject and verb correctly?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which sentence uses its subject and verb correctly?', 'The subject is the singular noun list, so it takes is.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The list of names are long.', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The list of names are long.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The list of names is long.', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The list of names is long.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The list of names be long.', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The list of names be long.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The list of names were long.', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The list of names were long.');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the main purpose of a thesis statement?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the main purpose of a thesis statement?', 'A thesis gives the reader the main argument or controlling idea of an essay.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To list every source', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To list every source');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To state the central claim', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To state the central claim');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To add a joke', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To add a joke');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To repeat the title', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To repeat the title');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which transition best shows contrast?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which transition best shows contrast?', 'However signals that the next idea differs from or qualifies the previous one.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Similarly', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Similarly');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'However', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'However');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Therefore', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Therefore');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'For example', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'For example');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'In context, what does infer mean?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'In context, what does infer mean?', 'To infer is to reach a reasoned conclusion using clues or evidence.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To conclude from evidence', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To conclude from evidence');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To copy a sentence', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To copy a sentence');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To define a word', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To define a word');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To ask a question', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To ask a question');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which revision is most concise?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which revision is most concise?', 'Because states the relationship directly with fewer unnecessary words.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Due to the fact that it rained, the game was canceled.', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Due to the fact that it rained, the game was canceled.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Because it rained, the game was canceled.', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Because it rained, the game was canceled.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The game was canceled due to rain happening.', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The game was canceled due to rain happening.');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rain was the reason why the game was canceled.', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rain was the reason why the game was canceled.');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What does a reliable source usually provide?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What does a reliable source usually provide?', 'Reliable sources identify their authorship and support claims with evidence.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Evidence and a clear author', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Evidence and a clear author');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Only anonymous opinions', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Only anonymous opinions');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Unverifiable rumors', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Unverifiable rumors');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'No supporting details', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'No supporting details');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which appeal relies mainly on evidence and reasoning?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which appeal relies mainly on evidence and reasoning?', 'Logos persuades through logic, facts, and reasoning.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Ethos', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Ethos');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Pathos', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Pathos');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Logos', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Logos');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Tone', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Tone');
  select id into strict v_subject_id from public.subjects where slug = 'english';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the best first step when revising an essay?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the best first step when revising an essay?', 'Revision begins with big-picture clarity before sentence-level editing.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Check the central idea and organization', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Check the central idea and organization');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Change every adjective', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Change every adjective');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Delete the conclusion', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Delete the conclusion');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Format the bibliography first', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Format the bibliography first');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What organelle is known as the cell''s control center?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What organelle is known as the cell''s control center?', 'The nucleus stores genetic material and directs many cell activities.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Nucleus', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Nucleus');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Ribosome', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Ribosome');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Cell wall', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Cell wall');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Vacuole', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Vacuole');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What gas do plants take in for photosynthesis?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What gas do plants take in for photosynthesis?', 'Plants use carbon dioxide, water, and light to make glucose during photosynthesis.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Oxygen', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Oxygen');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Nitrogen', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Nitrogen');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Carbon dioxide', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Carbon dioxide');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Hydrogen', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Hydrogen');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the basic unit of life?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the basic unit of life?', 'All living organisms are made of one or more cells.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Atom', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Atom');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Cell', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Cell');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Tissue', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Tissue');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Organ', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Organ');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What force pulls objects toward Earth?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What force pulls objects toward Earth?', 'Gravity is the attractive force between masses and gives objects weight.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Friction', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Friction');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Gravity', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Gravity');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Magnetism', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Magnetism');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Buoyancy', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Buoyancy');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which state of matter has a fixed volume but no fixed shape?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which state of matter has a fixed volume but no fixed shape?', 'A liquid keeps its volume but takes the shape of its container.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Solid', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Solid');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Liquid', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Liquid');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Gas', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Gas');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Plasma', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Plasma');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What type of energy is stored in food?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What type of energy is stored in food?', 'Chemical bonds in food store energy that cells can release.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Chemical', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Chemical');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Sound', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Sound');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Light', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Light');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Nuclear', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Nuclear');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which blood cells help defend the body from infection?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which blood cells help defend the body from infection?', 'White blood cells identify and help destroy pathogens.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Red blood cells', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Red blood cells');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'White blood cells', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'White blood cells');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Platelets', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Platelets');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Plasma cells only', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Plasma cells only');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the pH of a neutral solution at room temperature?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the pH of a neutral solution at room temperature?', 'A pH of 7 is neutral; values below 7 are acidic and above 7 are basic.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '0', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '0');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '5', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '5');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '14', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '14');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which process changes liquid water into water vapor?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which process changes liquid water into water vapor?', 'Evaporation occurs when liquid molecules gain enough energy to become gas.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Condensation', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Condensation');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Evaporation', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Evaporation');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Freezing', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Freezing');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Sublimation', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Sublimation');
  select id into strict v_subject_id from public.subjects where slug = 'science';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Why does a metal spoon feel colder than a wooden spoon in the same room?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Why does a metal spoon feel colder than a wooden spoon in the same room?', 'Metal is a better thermal conductor, so it draws heat from your hand more quickly.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Metal is always colder', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Metal is always colder');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Metal conducts heat away faster', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Metal conducts heat away faster');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Wood creates heat', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Wood creates heat');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Metal has no energy', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Metal has no energy');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the main idea of a passage?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the main idea of a passage?', 'The main idea is what the passage is mostly about and what it wants readers to understand.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Its central message', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Its central message');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The longest sentence', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The longest sentence');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A minor detail', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A minor detail');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The author''s name', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The author''s name');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which detail is strongest evidence for a claim?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which detail is strongest evidence for a claim?', 'A relevant statistic directly supports the claim with measurable information.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A relevant statistic', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A relevant statistic');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A random opinion', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A random opinion');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A decorative phrase', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A decorative phrase');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'An unrelated fact', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'An unrelated fact');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What can a heading help a reader predict?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What can a heading help a reader predict?', 'Headings preview the subject or focus of the text that follows.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The topic of the section', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The topic of the section');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The exact final sentence', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The exact final sentence');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The author''s password', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The author''s password');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The page count only', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The page count only');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'A character who changes after an experience is described as what?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'A character who changes after an experience is described as what?', 'A dynamic character develops or changes as the story progresses.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Static', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Static');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Dynamic', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Dynamic');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Unrelated', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Unrelated');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Narrative', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Narrative');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What does context help a reader determine?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What does context help a reader determine?', 'Surrounding words and ideas provide clues to a word''s meaning.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Meaning of an unfamiliar word', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Meaning of an unfamiliar word');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The font size', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The font size');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The number of paragraphs', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The number of paragraphs');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'The author''s age', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'The author''s age');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which text structure compares two ideas?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which text structure compares two ideas?', 'Compare-and-contrast structure identifies similarities and differences.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Cause and effect', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Cause and effect');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Compare and contrast', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Compare and contrast');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Chronological order', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Chronological order');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Problem and solution', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Problem and solution');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'An author''s attitude toward a topic is called what?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'An author''s attitude toward a topic is called what?', 'Tone is the author''s attitude, conveyed through word choice and style.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Tone', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Tone');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Plot', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Plot');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Setting', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Setting');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Conflict', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Conflict');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is an inference?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is an inference?', 'Readers infer by combining text evidence with their reasoning.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A conclusion supported by clues', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A conclusion supported by clues');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A directly quoted title', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A directly quoted title');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A spelling rule', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A spelling rule');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A list of characters', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A list of characters');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Why should a reader distinguish fact from opinion?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Why should a reader distinguish fact from opinion?', 'The distinction helps readers judge whether a statement can be verified or reflects a viewpoint.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To evaluate support and credibility', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To evaluate support and credibility');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To make every text shorter', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To make every text shorter');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To avoid all questions', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To avoid all questions');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'To memorize punctuation', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'To memorize punctuation');
  select id into strict v_subject_id from public.subjects where slug = 'reading-comprehension';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the best summary of a passage?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the best summary of a passage?', 'A summary condenses the most important ideas without unnecessary details or opinions.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Its key points in fewer words', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Its key points in fewer words');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Every sentence copied', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Every sentence copied');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Only the first detail', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Only the first detail');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'A personal response only', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'A personal response only');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the capital of the Philippines?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the capital of the Philippines?', 'Manila is the capital city of the Philippines.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Cebu', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Cebu');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Davao', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Davao');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Manila', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Manila');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Baguio', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Baguio');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which ocean is the largest?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which ocean is the largest?', 'The Pacific Ocean covers more area than any other ocean.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Atlantic', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Atlantic');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Indian', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Indian');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Arctic', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Arctic');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Pacific', true, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Pacific');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'How many continents are commonly recognized?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'How many continents are commonly recognized?', 'The commonly taught model includes seven continents.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '5', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '5');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '6', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '6');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '7', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '7');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, '8', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = '8');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which instrument measures temperature?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which instrument measures temperature?', 'A thermometer measures how hot or cold something is.', 'easy') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Barometer', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Barometer');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Thermometer', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Thermometer');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Compass', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Compass');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Altimeter', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Altimeter');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What does democracy generally mean?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What does democracy generally mean?', 'Democracy is a system in which people participate in choosing or directing government.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rule by the people', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rule by the people');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rule by one family', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rule by one family');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rule by weather', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rule by weather');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rule without laws', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rule without laws');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which resource is renewable?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which resource is renewable?', 'Sunlight is naturally replenished, unlike fossil fuels.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Coal', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Coal');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Oil', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Oil');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Solar energy', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Solar energy');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Natural gas', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Natural gas');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the currency of Japan?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the currency of Japan?', 'The yen is Japan''s official currency.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Won', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Won');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Yen', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Yen');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Baht', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Baht');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Rupee', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Rupee');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Which branch interprets laws in a government with separated powers?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Which branch interprets laws in a government with separated powers?', 'The judicial branch interprets laws and resolves legal disputes.', 'medium') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Executive', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Executive');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Legislative', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Legislative');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Judicial', true, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Judicial');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Electoral', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Electoral');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'What is the study of past events called?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'What is the study of past events called?', 'History examines and interprets events and developments from the past.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Geography', false, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Geography');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'History', true, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'History');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Biology', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Biology');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'Economics', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'Economics');
  select id into strict v_subject_id from public.subjects where slug = 'general-knowledge';
  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = 'Why are primary sources valuable in research?' limit 1;
  if v_question_id is null then
    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, 'Why are primary sources valuable in research?', 'Primary sources offer firsthand records or evidence connected directly to an event or period.', 'hard') returning id into v_question_id;
  end if;
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'They provide direct evidence from the time', true, 1 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'They provide direct evidence from the time');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'They are always shorter', false, 2 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'They are always shorter');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'They contain no perspective', false, 3 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'They contain no perspective');
  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, 'They replace all analysis', false, 4 where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = 'They replace all analysis');
end;
$seed$;
commit;
