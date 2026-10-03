import fs from 'node:fs'
import { allTopics, authoritativeSources } from './content-catalog.mjs'

const bank = JSON.parse(fs.readFileSync(new URL('../supabase/seed/content-bank.json', import.meta.url), 'utf8'))
const destination = new URL('../supabase/seed/005_deep_lessons.sql', import.meta.url)
const q = (value) => `'${String(value).replaceAll("'", "''")}'`
const array = (values) => `array[${values.map(q).join(',')}]::text[]`
const json = (value) => `${q(JSON.stringify(value))}::jsonb`

const profiles = {
  mathematics: {
    application: 'CET items usually combine the basic rule with an unfamiliar-looking expression, diagram, or word problem. The reliable approach is to translate the information, choose the governing relationship, solve carefully, and check the result.',
    objectives: ['represent the given information accurately', 'select and apply the appropriate formula or property', 'show an efficient solution without skipping essential reasoning', 'check magnitude, sign, units, and reasonableness'],
    steps: ['Identify what is given and what must be found.', 'Rewrite the information using symbols, a table, or a labeled sketch.', 'Choose the property or formula that connects the known and unknown values.', 'Carry out one justified operation at a time and keep units consistent.', 'Substitute the result back or estimate to confirm that it is reasonable.'],
    mistakes: ['Starting computation before identifying the required quantity.', 'Applying a memorized formula to the wrong relationship.', 'Dropping a negative sign, unit, exponent, or grouping symbol.', 'Accepting an answer without checking it against the original conditions.'],
    tips: ['Estimate before solving so unreasonable options are easier to eliminate.', 'Write one clean intermediate line for multi-step calculations.', 'Use answer choices strategically, but still verify the governing method.', 'Return to skipped hard items after securing faster questions.'],
  },
  science: {
    application: 'CET science questions reward connected understanding: identify the system, recall the governing principle, predict what changes, and distinguish evidence from assumption. Memorized terms help only when their functions and relationships are understood.',
    objectives: ['define the major structures, quantities, or processes', 'explain cause-and-effect relationships', 'apply a scientific principle to a new situation', 'interpret observations, variables, and evidence'],
    steps: ['Name the branch and system involved.', 'List the relevant facts or variables from the question.', 'Recall the law, process, or structure–function relationship that governs the situation.', 'Predict the result while holding unrelated factors constant.', 'Check that the conclusion follows from evidence rather than an unsupported assumption.'],
    mistakes: ['Confusing related terms that operate at different levels.', 'Treating correlation as proof of causation.', 'Ignoring a controlled variable or stated experimental condition.', 'Choosing an absolute claim when the evidence supports only a limited conclusion.'],
    tips: ['Sketch cycles, forces, circuits, or systems when relationships are hard to track.', 'Pay attention to words such as increase, decrease, constant, and most directly.', 'Eliminate choices that violate conservation, structure–function, or fair-test principles.', 'Use units and direction to check physics and chemistry calculations.'],
  },
  'english-language': {
    application: 'Language-proficiency items test whether a sentence communicates a precise meaning according to standard formal English. Read the whole sentence, identify its core structure, and then examine agreement, reference, tense, modification, punctuation, and word choice.',
    objectives: ['identify the grammatical structure being tested', 'explain why one form is standard and the alternatives are not', 'revise without changing the intended meaning', 'use context to resolve vocabulary and usage'],
    steps: ['Read the complete sentence for meaning before inspecting individual words.', 'Locate the subject, main verb, clauses, and modifying phrases.', 'Apply the specific agreement, tense, reference, or punctuation rule.', 'Remove choices that introduce ambiguity, redundancy, or a change in meaning.', 'Read the selected sentence naturally one final time.'],
    mistakes: ['Matching a verb with a nearby noun instead of the true subject.', 'Fixing one error while introducing a different grammatical error.', 'Choosing an option merely because it sounds familiar.', 'Ignoring the surrounding context when interpreting a word or pronoun.'],
    tips: ['Temporarily remove interrupting phrases to expose the sentence core.', 'Compare only the portion that changes across answer choices.', 'Prefer clear and economical wording when several options are grammatical.', 'For vocabulary, substitute the proposed meaning back into the sentence.'],
  },
  'filipino-language': {
    application: 'Sinusukat sa bahaging ito ang malinaw at wastong paggamit ng Filipino. Unawain muna ang buong diwa, saka suriin ang kayarian, ugnayan ng mga salita, bantas, at kahulugang hinihingi ng konteksto.',
    objectives: ['matukoy ang tuntuning sinusukat sa pangungusap', 'maipaliwanag kung bakit wasto ang isang anyo', 'maiayos ang pahayag nang hindi binabago ang diwa', 'magamit ang konteksto sa pagpapakahulugan'],
    steps: ['Basahin ang buong pangungusap at tukuyin ang nais nitong sabihin.', 'Kilalanin ang simuno, panaguri, sugnay, at salitang nag-uugnay.', 'Ilapat ang tuntunin sa wastong gamit, aspekto, bantas, o kayarian.', 'Alisin ang sagot na malabo, salungat, o nagbabago sa orihinal na diwa.', 'Basahin muli ang napiling sagot upang tiyakin ang linaw at natural na daloy.'],
    mistakes: ['Pagpili batay lamang sa tunog at hindi sa tuntunin.', 'Pagpapalit ng “ng” at “nang” nang hindi sinusuri ang gamit.', 'Hindi pagtukoy sa malinaw na tinutukoy ng panghalip.', 'Literal na pagbasa sa idyoma o tayutay.'],
    tips: ['Hanapin muna ang diwa bago suriin ang maliliit na detalye.', 'Tingnan ang mga salitang hudyat ng sanhi, bunga, pagsalungat, at pagkakasunod.', 'Ihambing ang mga pagpipilian sa parehong konteksto.', 'Piliin ang malinaw, wasto, at pinakamatipid na pahayag.'],
  },
  'reading-comprehension': {
    application: 'Reading questions are evidence tasks. A defensible answer must match the passage’s actual scope, wording, and purpose—not merely something that could be true outside the text.',
    objectives: ['state the central idea at the correct level of scope', 'locate evidence for explicit and inferred claims', 'analyze tone, purpose, structure, and context', 'synthesize prose with tables or a second text'],
    steps: ['Preview the question so you know what evidence to track.', 'Read the passage for its claim, structure, and changes in direction.', 'Mark the sentence or data point that supports each possible answer.', 'Reject choices that are unsupported, too broad, too narrow, or reversed.', 'Restate the winning answer in your own words and compare it with the text.'],
    mistakes: ['Selecting a true statement that does not answer the question.', 'Using personal knowledge instead of passage evidence.', 'Treating one detail as the main idea of the entire passage.', 'Choosing extreme language when the author uses qualified language.'],
    tips: ['Return to the relevant lines instead of relying on memory.', 'Watch contrast signals such as however, although, and but.', 'For inference, choose what must or most reasonably follows.', 'Check axes, units, legends, and time periods in visual information.'],
  },
  'mental-logical-reasoning': {
    application: 'Reasoning items measure rule discovery and disciplined deduction. Separate the information given from assumptions, test the simplest consistent rule first, and require the rule to explain every element.',
    objectives: ['identify a consistent relationship or pattern', 'distinguish necessary conclusions from possible ones', 'evaluate assumptions and evidence', 'judge whether information is sufficient'],
    steps: ['List only the facts, positions, or symbols actually given.', 'Test simple features first: count, difference, ratio, order, direction, or category.', 'State the candidate rule explicitly.', 'Apply it to every element and reject it if even one element conflicts.', 'Use the surviving rule to derive the answer without adding unstated facts.'],
    mistakes: ['Choosing a pattern that fits only the last two terms.', 'Reversing the direction of an analogy.', 'Assuming the converse of a conditional statement.', 'Combining statements before testing each one separately in data sufficiency.'],
    tips: ['Convert letters to positions and diagrams to simple feature lists.', 'For syllogisms, draw sets or use a small Venn diagram.', 'In arguments, ask which fact directly changes confidence in the conclusion.', 'Move on when no stable rule appears, then revisit with fresh attention.'],
  },
}

const lines = [
  '-- Generated structured lessons. Run after migration 004_deep_lessons.sql and seed 003_cet_content.sql.',
  'begin;',
  "update public.lessons set status='archived' where topic_id is null;",
]

for (const topic of allTopics) {
  const profile = profiles[topic.subjectSlug]
  const questions = bank.filter((item) => item.subjectSlug === topic.subjectSlug && item.topicSlug === topic.slug)
  if (!profile) throw new Error(`No lesson profile exists for ${topic.subjectSlug}.`)
  if (questions.length < 6) throw new Error(`${topic.subjectSlug}/${topic.slug} needs at least six validated questions for examples and checks.`)
  if (!topic.sourceKeys.length || topic.sourceKeys.some((key) => !authoritativeSources[key])) {
    throw new Error(`${topic.subjectSlug}/${topic.slug} has missing authoritative source metadata.`)
  }
  const isFilipino = topic.subjectSlug === 'filipino-language'
  const overview = isFilipino
    ? `${topic.summary} Hindi sapat ang pagsasaulo ng termino; kailangang makita kung paano gumagana ang tuntunin sa buong pangungusap at sa tiyak na konteksto.\n\n${profile.application}`
    : `${topic.summary} This lesson moves from the underlying idea to a repeatable method, then applies it to CET-style examples. The goal is not just to remember an answer but to explain why the method works and when it applies.\n\n${profile.application}`
  const objectives = profile.objectives.map((objective) => isFilipino ? objective : `${objective.charAt(0).toUpperCase()}${objective.slice(1)} in ${topic.title.toLowerCase()}.`)
  const concepts = [
    { title: isFilipino ? 'Pangunahing diwa' : 'Foundation', body: topic.summary },
    { title: isFilipino ? 'Mahalagang tuntunin' : 'Governing rule', body: topic.rule },
    { title: isFilipino ? 'Gamit sa pagsusulit' : 'CET application', body: profile.application },
  ]
  const workedExamples = questions.slice(0, 3).map((item, index) => ({
    title: isFilipino ? `Halimbawang may gabay ${index + 1}` : `Guided example ${index + 1}`,
    passage: item.passage,
    prompt: item.question,
    answer: item.correctAnswer,
    solution: item.explanation,
  }))
  const quickChecks = questions.slice(3, 6).map((item) => ({ prompt: item.question, answer: item.correctAnswer, explanation: item.explanation }))
  const sourceLinks = topic.sourceKeys.map((key) => authoritativeSources[key]).map(({ title, url }) => ({ title, url }))
  lines.push(`update public.lessons l set overview=${q(overview)},objectives=${array(objectives)},concept_sections=${json(concepts)},method_steps=${array(profile.steps)},worked_examples=${json(workedExamples)},common_mistakes=${array(profile.mistakes)},exam_tips=${array(profile.tips)},quick_checks=${json(quickChecks)},source_links=${json(sourceLinks)},estimated_minutes=20,status='published' from public.topics t join public.subjects s on s.id=t.subject_id where l.topic_id=t.id and t.slug=${q(topic.slug)} and s.slug=${q(topic.subjectSlug)};`)
}

lines.push('commit;', '')
fs.writeFileSync(destination, lines.join('\n'))
console.log(`Generated in-depth content for ${allTopics.length} lessons.`)
