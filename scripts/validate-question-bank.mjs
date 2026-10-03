import fs from 'node:fs'
import { allTopics, authoritativeSources } from './content-catalog.mjs'

const bank = JSON.parse(fs.readFileSync(new URL('../supabase/seed/content-bank.json', import.meta.url), 'utf8'))
const errors = []
const warnings = []
const expectedSubjects = new Map([
  ['mathematics', 240], ['science', 240], ['english-language', 180],
  ['filipino-language', 180], ['reading-comprehension', 180], ['mental-logical-reasoning', 180],
])
const normalize = (value) => String(value).toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9\u00c0-\u024f]+/g, ' ').trim()
const tokens = (value) => new Set(normalize(value).split(' ').filter((token) => token.length > 2))
const similarity = (a, b) => {
  const union = new Set([...a, ...b]); if (!union.size) return 1
  let intersection = 0; for (const token of a) if (b.has(token)) intersection++
  return intersection / union.size
}

if (bank.length !== 1200) errors.push(`Expected exactly 1,200 questions; found ${bank.length}.`)
if (allTopics.length !== 60) errors.push(`Expected exactly 60 topics; found ${allTopics.length}.`)
for (const [slug, expected] of expectedSubjects) {
  const actual = bank.filter((item) => item.subjectSlug === slug).length
  if (actual !== expected) errors.push(`${slug}: expected ${expected}, found ${actual}.`)
}
for (const topic of allTopics) {
  const items = bank.filter((item) => item.subjectSlug === topic.subjectSlug && item.topicSlug === topic.slug)
  if (items.length !== 20) errors.push(`${topic.subjectSlug}/${topic.slug}: expected 20, found ${items.length}.`)
  const split = Object.fromEntries(['easy','medium','hard'].map((level) => [level, items.filter((item) => item.difficulty === level).length]))
  if (split.easy !== 6 || split.medium !== 10 || split.hard !== 4) errors.push(`${topic.slug}: difficulty must be 6/10/4, found ${split.easy}/${split.medium}/${split.hard}.`)
}

const signatures = new Map()
for (const [index, item] of bank.entries()) {
  const label = item.id || `question ${index + 1}`
  if (!item.question?.trim()) errors.push(`${label}: missing stem.`)
  if (item.choices?.length !== 4 || new Set(item.choices).size !== 4) errors.push(`${label}: requires four distinct choices.`)
  if (item.choices?.filter((choice) => choice === item.correctAnswer).length !== 1) errors.push(`${label}: answer key must match exactly one choice.`)
  if (!item.explanation?.trim() || normalize(item.explanation) === normalize(item.correctAnswer)) errors.push(`${label}: explanation is missing or circular.`)
  if (item.validationRounds !== 2 || item.status !== 'published' || !item.verifiedAt) errors.push(`${label}: publication gate is incomplete.`)
  if (!Array.isArray(item.sources) || !item.sources.length || item.sources.some((source) => !source.url || source.kind !== 'authoritative-reference')) errors.push(`${label}: authoritative source metadata is required.`)
  if (!item.sources.some((source) => Object.values(authoritativeSources).some((official) => official.url === source.url))) errors.push(`${label}: source is not in the approved official set.`)
  const signature = normalize(`${item.passage ?? ''} ${item.question} ${item.choices.join(' ')}`)
  if (signatures.has(signature)) errors.push(`${label}: exact duplicate of ${signatures.get(signature)}.`)
  signatures.set(signature, label)
}

for (const topic of allTopics) {
  const items = bank.filter((item) => item.topicSlug === topic.slug)
  for (let left = 0; left < items.length; left++) for (let right = left + 1; right < items.length; right++) {
    const score = similarity(tokens(`${items[left].passage ?? ''} ${items[left].question}`), tokens(`${items[right].passage ?? ''} ${items[right].question}`))
    if (score >= 0.85) warnings.push({ left: items[left].id, right: items[right].id, score: Number(score.toFixed(3)), disposition: 'parameterized practice variant; retain only when operands, passage, or tested usage differ' })
  }
}

fs.mkdirSync(new URL('../docs/', import.meta.url), { recursive: true })
fs.writeFileSync(new URL('../docs/question-similarity-review.json', import.meta.url), `${JSON.stringify(warnings, null, 2)}\n`)
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log(`Validated 1,200 published questions, 60 topics, 4 choices, 2 review rounds, official provenance, and 30/50/20 difficulty. ${warnings.length} similarity candidates recorded for editorial comparison.`)
