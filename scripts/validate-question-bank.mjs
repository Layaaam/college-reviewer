import fs from 'node:fs'
const bank = JSON.parse(fs.readFileSync(new URL('../supabase/seed/questions.json', import.meta.url)))
const subjects = ['Mathematics', 'English', 'Science', 'Reading Comprehension', 'General Knowledge']
const errors = []
for (const subject of subjects) { const items = bank.filter((q) => q.subject === subject); if (items.length !== 10) errors.push(`${subject}: expected 10, got ${items.length}`) }
for (const [index, question] of bank.entries()) { const choices = question.choices ?? []; if (choices.length !== 4) errors.push(`question ${index + 1}: expected 4 choices`); if (new Set(choices).size !== 4) errors.push(`question ${index + 1}: duplicate choices`); if (choices.filter((choice) => choice === question.correctAnswer).length !== 1) errors.push(`question ${index + 1}: invalid answer key`); if (!question.explanation?.trim()) errors.push(`question ${index + 1}: missing explanation`) }
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log(`Validated ${bank.length} questions: 5 subjects × 10, four unique choices, one correct answer each.`)
