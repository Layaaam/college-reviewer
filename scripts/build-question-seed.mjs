import fs from 'node:fs'

const source = new URL('../supabase/seed/questions.json', import.meta.url)
const destination = new URL('../supabase/seed/002_questions.sql', import.meta.url)
const questions = JSON.parse(fs.readFileSync(source, 'utf8'))
const slugs = new Map([
  ['Mathematics', 'mathematics'],
  ['English', 'english'],
  ['Science', 'science'],
  ['Reading Comprehension', 'reading-comprehension'],
  ['General Knowledge', 'general-knowledge'],
])
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`

const lines = [
  '-- Generated from questions.json by npm run seed:questions:sql.',
  '-- Run after 001_subjects_lessons.sql. The transaction rolls back on error.',
  'begin;',
  'do $seed$',
  'declare',
  '  v_subject_id uuid;',
  '  v_question_id uuid;',
  'begin',
]

for (const question of questions) {
  const slug = slugs.get(question.subject)
  if (!slug) throw new Error(`Unknown subject: ${question.subject}`)
  if (question.choices.length !== 4 || new Set(question.choices).size !== 4 ||
      question.choices.filter((choice) => choice === question.correctAnswer).length !== 1) {
    throw new Error(`Invalid choices for: ${question.question}`)
  }

  lines.push(`  select id into strict v_subject_id from public.subjects where slug = ${quote(slug)};`)
  lines.push(`  select id into v_question_id from public.questions where subject_id = v_subject_id and question_text = ${quote(question.question)} limit 1;`)
  lines.push('  if v_question_id is null then')
  lines.push(`    insert into public.questions (subject_id, question_text, explanation, difficulty) values (v_subject_id, ${quote(question.question)}, ${quote(question.explanation)}, ${quote(question.difficulty)}) returning id into v_question_id;`)
  lines.push('  end if;')
  for (const [index, choice] of question.choices.entries()) {
    lines.push(`  insert into public.question_choices (question_id, choice_text, is_correct, sort_order) select v_question_id, ${quote(choice)}, ${choice === question.correctAnswer}, ${index + 1} where not exists (select 1 from public.question_choices where question_id = v_question_id and choice_text = ${quote(choice)});`)
  }
}

lines.push('end;', '$seed$;', 'commit;', '')
fs.writeFileSync(destination, lines.join('\n'))
console.log(`Generated SQL for ${questions.length} questions at ${destination.pathname}`)
