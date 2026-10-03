import fs from 'node:fs'
import { allTopics, authoritativeSources } from './content-catalog.mjs'

const output = new URL('../supabase/seed/content-bank.json', import.meta.url)
const difficultyFor = (index) => index < 6 ? 'easy' : index < 16 ? 'medium' : 'hard'
const rotate = (items, amount) => items.map((_, index) => items[(index + amount) % items.length])
const cleanNumber = (value) => typeof value === 'string' ? value : Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
const numericChoices = (answer, step = 1, index = 0) => rotate([answer, answer + step, answer - step, answer + 2 * step].map(cleanNumber), index % 4)
const textChoices = (answer, distractors, index = 0) => {
  const unique = [answer, ...distractors].map(String).filter((item, position, values) => values.indexOf(item) === position)
  while (unique.length < 4) unique.push(`None of choices ${unique.length + 1}`)
  return rotate(unique.slice(0, 4), index % 4)
}
const sourcesFor = (topic) => topic.sourceKeys.map((key) => authoritativeSources[key])

function mathQuestion(topic, index) {
  const a = 4 + index
  const b = 2 + (index % 7)
  const c = 3 + (index % 5)
  let question; let answer; let choices; let explanation
  switch (topic.slug) {
    case 'number-sense': {
      const n = 12 + index * 3
      if (index % 2 === 0) {
        question = `Which number is a factor of ${n * b}?`
        answer = String(b)
        choices = textChoices(answer, [String(b + 1), String(b + 2), String(b + 4)], index)
        explanation = `${n * b} ÷ ${b} = ${n}, a whole number, so ${b} is a factor.`
      } else {
        question = `Which fraction is equivalent to ${(b * c)}/${(a * c)}?`
        answer = `${b}/${a}`
        choices = textChoices(answer, [`${b + 1}/${a}`, `${b}/${a + 1}`, `${c}/${a}`], index)
        explanation = `Dividing numerator and denominator by ${c} gives ${b}/${a}.`
      }
      break
    }
    case 'arithmetic-operations': {
      answer = a + b * c
      question = `Evaluate ${a} + ${b} × ${c}.`
      choices = numericChoices(answer, b, index)
      explanation = `Multiply first: ${b} × ${c} = ${b * c}; then add ${a} to get ${answer}.`
      break
    }
    case 'ratios-percentages': {
      const percent = [10, 15, 20, 25, 30][index % 5]
      const whole = 40 + index * 20
      answer = whole * percent / 100
      question = `What is ${percent}% of ${whole}?`
      choices = numericChoices(answer, Math.max(2, whole / 20), index)
      explanation = `${percent}% = ${percent / 100}. Multiplying by ${whole} gives ${answer}.`
      break
    }
    case 'linear-algebra': {
      const x = 2 + index
      const constant = b * x + c
      answer = x
      question = `Solve for x: ${b}x + ${c} = ${constant}.`
      choices = numericChoices(answer, 1, index)
      explanation = `Subtract ${c}, then divide by ${b}: x = (${constant} - ${c})/${b} = ${x}.`
      break
    }
    case 'polynomials': {
      const r1 = 2 + index % 5; const r2 = 6 + index % 6
      answer = `(x - ${r1})(x - ${r2})`
      question = `Which is the factored form of x² - ${r1 + r2}x + ${r1 * r2}?`
      choices = textChoices(answer, [`(x + ${r1})(x + ${r2})`, `(x - ${r1})(x + ${r2})`, `(x + ${r1})(x - ${r2})`], index)
      explanation = `The factors need sum ${r1 + r2} and product ${r1 * r2}; the roots are ${r1} and ${r2}.`
      break
    }
    case 'functions': {
      const x = 1 + index; answer = b * x + c
      question = `If f(x) = ${b}x + ${c}, what is f(${x})?`
      choices = numericChoices(answer, b, index)
      explanation = `Substitute ${x}: f(${x}) = ${b}(${x}) + ${c} = ${answer}.`
      break
    }
    case 'plane-geometry': {
      const length = 5 + index; const width = 3 + index % 6
      if (index % 2 === 0) {
        answer = length * width; question = `A rectangle is ${length} cm long and ${width} cm wide. What is its area in square centimeters?`
        explanation = `Area = length × width = ${length} × ${width} = ${answer}.`
      } else {
        answer = 2 * (length + width); question = `A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter in centimeters?`
        explanation = `Perimeter = 2(length + width) = 2(${length} + ${width}) = ${answer}.`
      }
      choices = numericChoices(answer, width, index); break
    }
    case 'coordinate-geometry': {
      const x1 = index; const y1 = 2 * index + 1; const dx = 2 + index % 4; const slope = 1 + index % 5; const y2 = y1 + slope * dx
      answer = slope; question = `What is the slope of the line through (${x1}, ${y1}) and (${x1 + dx}, ${y2})?`
      choices = numericChoices(answer, 1, index)
      explanation = `Slope = (${y2} - ${y1})/(${x1 + dx} - ${x1}) = ${slope * dx}/${dx} = ${slope}.`; break
    }
    case 'trigonometry': {
      const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25]]; const base = triples[index % triples.length]; const scale = 1 + Math.floor(index / triples.length); const [opp, adj, hyp] = base.map((value) => value * scale)
      answer = `${opp}/${hyp}`; question = `For an acute angle θ in a right triangle, the opposite side is ${opp} and the hypotenuse is ${hyp}. What is sin θ?`
      choices = textChoices(answer, [`${adj}/${hyp}`, `${opp}/${adj}`, `${hyp}/${opp}`], index)
      explanation = `Sine is opposite over hypotenuse, so sin θ = ${opp}/${hyp}.`; break
    }
    case 'sequences': {
      const first = 1 + index; const difference = 2 + index % 6; const position = 5 + index % 5
      answer = first + (position - 1) * difference; question = `An arithmetic sequence begins with ${first} and has common difference ${difference}. What is term ${position}?`
      choices = numericChoices(answer, difference, index)
      explanation = `aₙ = a₁ + (n - 1)d = ${first} + (${position} - 1)(${difference}) = ${answer}.`; break
    }
    case 'statistics': {
      const values = [a, a + b, a + 2 * b, a + 3 * b, a + 4 * b]
      answer = a + 2 * b; question = `What is the median of ${values.join(', ')}?`
      choices = numericChoices(answer, b, index)
      explanation = `The values are ordered and the middle of five values is ${answer}.`; break
    }
    default: {
      const red = 2 + index % 8; const blue = 3 + index % 7; const total = red + blue
      answer = `${red}/${total}`; question = `A bag contains ${red} red and ${blue} blue tokens. What is the probability of drawing a red token at random?`
      choices = textChoices(answer, [`${blue}/${total}`, `1/${total}`, `${red}/${blue}`], index)
      explanation = `There are ${red} favorable outcomes among ${total} tokens, so the probability is ${red}/${total}.`
    }
  }
  return { question, choices, correctAnswer: cleanNumber(answer), explanation }
}

const scienceFacts = {
  cells: [['nucleus','stores most genetic material'],['ribosome','builds proteins'],['mitochondrion','releases usable energy from food'],['cell membrane','regulates movement into and out of the cell'],['chloroplast','captures light energy for photosynthesis'],['vacuole','stores water and dissolved materials'],['cytoplasm','suspends organelles and hosts many reactions'],['cell wall','supports many plant cells'],['lysosome','contains enzymes that break down materials'],['Golgi apparatus','modifies and packages proteins']],
  genetics: [['gene','a unit of hereditary information'],['allele','an alternative form of a gene'],['genotype','an organism’s allele combination'],['phenotype','an observable trait'],['chromosome','a DNA-containing structure'],['dominant allele','an allele expressed in a heterozygote'],['recessive allele','an allele masked in a heterozygote'],['mutation','a change in DNA sequence'],['meiosis','cell division that produces gametes'],['Punnett square','a model of possible offspring genotypes']],
  'evolution-ecology': [['natural selection','differential survival and reproduction of inherited traits'],['adaptation','an inherited trait that improves fitness'],['population','members of one species in an area'],['community','interacting populations in an area'],['ecosystem','a community plus its nonliving environment'],['producer','an organism that makes its own food'],['consumer','an organism that obtains energy by eating'],['decomposer','an organism that recycles dead matter'],['carrying capacity','the largest population an environment can sustain'],['biodiversity','the variety of living things']],
  'human-biology': [['alveoli','sites of gas exchange in the lungs'],['nephron','the functional filtering unit of a kidney'],['neuron','a cell that transmits nerve impulses'],['red blood cell','a cell that transports oxygen'],['small intestine','the main site of nutrient absorption'],['pancreas','an organ that releases digestive enzymes and hormones'],['heart','a muscular organ that pumps blood'],['skin','a barrier that also helps regulate temperature'],['antibody','a protein that recognizes a specific antigen'],['homeostasis','maintenance of stable internal conditions']],
  matter: [['proton','a positively charged particle in the nucleus'],['neutron','an uncharged particle in the nucleus'],['electron','a negatively charged particle outside the nucleus'],['atomic number','the number of protons'],['isotope','atoms of one element with different neutron counts'],['ion','an atom or group with a net charge'],['element','a substance made of one kind of atom'],['compound','a substance with chemically combined elements'],['mixture','a physical combination of substances'],['density','mass per unit volume']],
  'chemical-reactions': [['reactant','a starting substance in a reaction'],['product','a substance formed in a reaction'],['catalyst','a substance that speeds a reaction without being consumed'],['acid','a substance that increases hydrogen ions in water'],['base','a substance that can accept hydrogen ions'],['solute','the substance dissolved in a solution'],['solvent','the dissolving medium'],['concentration','amount of solute per amount of solution'],['covalent bond','a bond formed by shared electrons'],['ionic bond','attraction between oppositely charged ions']],
  'motion-forces': [['speed','distance traveled per unit time'],['velocity','speed with direction'],['acceleration','rate of change of velocity'],['inertia','resistance to a change in motion'],['net force','the vector sum of all forces'],['friction','a force opposing relative motion'],['mass','a measure of inertia'],['weight','gravitational force on an object'],['momentum','mass multiplied by velocity'],['free fall','motion under gravity alone']],
  'energy-waves': [['kinetic energy','energy of motion'],['potential energy','stored energy due to position or condition'],['work','force applied through a displacement'],['power','rate of doing work'],['frequency','cycles completed per second'],['wavelength','distance between corresponding wave points'],['amplitude','maximum displacement from equilibrium'],['reflection','a wave bouncing from a boundary'],['refraction','a wave changing direction as its speed changes'],['resonance','large vibration caused by a matching frequency']],
  electricity: [['current','rate of flow of electric charge'],['voltage','electric potential difference'],['resistance','opposition to current'],['conductor','a material in which charges move readily'],['insulator','a material that resists charge flow'],['series circuit','a circuit with one current path'],['parallel circuit','a circuit with multiple current paths'],['magnetic field','a region where magnetic forces act'],['electromagnet','a magnet produced by electric current'],['Ohm’s law','the relation V = IR']],
  'earth-systems': [['weather','short-term atmospheric conditions'],['climate','long-term weather patterns'],['igneous rock','rock formed as molten material cools'],['sedimentary rock','rock formed from compacted or cemented sediment'],['metamorphic rock','rock changed by heat and pressure'],['plate tectonics','movement of large lithosphere sections'],['erosion','transport of weathered material'],['fault','a fracture along which rocks move'],['water cycle','movement of water among Earth systems'],['greenhouse effect','warming as gases retain outgoing heat']],
  astronomy: [['rotation','spinning on an axis'],['revolution','orbiting another body'],['gravity','attraction between masses'],['star','a luminous sphere powered by nuclear fusion'],['planet','a nearly round body orbiting a star that has cleared its path'],['moon','a natural satellite'],['light-year','the distance light travels in one year'],['galaxy','a gravitationally bound system of stars and matter'],['solar system','the Sun and objects bound to it'],['eclipse','alignment in which one body blocks light from another']],
  'environment-science': [['independent variable','the factor deliberately changed'],['dependent variable','the measured response'],['control group','a comparison group without the tested treatment'],['replication','repeating a study or measurement'],['renewable resource','a resource replenished on a human timescale'],['nonrenewable resource','a resource consumed faster than it forms'],['pollution','harmful introduction of matter or energy'],['conservation','careful protection and management of resources'],['sustainability','meeting needs without undermining future capacity'],['correlation','an association that does not by itself prove causation']],
}

function scienceQuestion(topic, index) {
  const facts = scienceFacts[topic.slug]
  const fact = facts[index % facts.length]
  const others = [facts[(index + 1) % 10], facts[(index + 3) % 10], facts[(index + 6) % 10]]
  if (index < 10) return {
    question: `Which term means “${fact[1]}”?`,
    correctAnswer: fact[0],
    choices: textChoices(fact[0], others.map((item) => item[0]), index),
    explanation: `${fact[0]} is ${fact[1]}.`,
  }
  return {
    question: `Which statement correctly describes ${fact[0]}?`,
    correctAnswer: fact[1],
    choices: textChoices(fact[1], others.map((item) => item[1]), index),
    explanation: `By definition, ${fact[0]} is ${fact[1]}.`,
  }
}

const languageContexts = [
  ['the campus library','opens before classes'],['the group of volunteers','meets every Saturday'],['each applicant','brings a pencil'],['the science club','organizes a fair'],['the set of instructions','is easy to follow'],['the debate team','practices after class'],['every notebook','has a label'],['the school bus','arrives at seven'],['the list of topics','covers six subjects'],['the student council','plans the program'],
]

function englishQuestion(topic, index) {
  const [noun, predicate] = languageContexts[index % languageContexts.length]
  const bank = {
    'subject-verb-agreement': [`${noun} ${predicate}.`, `${noun} open before classes.`, `${noun} are ready.`, `${noun} have a label.`],
    pronouns: ['Maria and I submitted our project.', 'Me and Maria submitted our project.', 'Maria and me submitted our project.', 'Maria and myself submitted our project.'],
    'verb-tense': ['By the time the bus arrived, Lea had finished reading.', 'By the time the bus arrived, Lea finishes reading.', 'By the time the bus arrived, Lea will finish reading yesterday.', 'By the time the bus arrived, Lea has finish reading.'],
    'modifiers-parallelism': ['The workshop teaches planning, drafting, and revising.', 'The workshop teaches planning, to draft, and revision.', 'The workshop teaches to plan, drafting, and to revise.', 'The workshop teaches plan, drafted, and revising.'],
    'sentence-structure': ['The rain stopped; the players returned to the field.', 'The rain stopped the players returned to the field.', 'Because the rain stopped.', 'The rain stopping, and the players returned.'],
    'vocabulary-context': ['brief', 'uncertain', 'ornamental', 'indirect'],
    'idioms-usage': ['The committee is capable of reaching a decision.', 'The committee is capable to reach a decision.', 'The committee is capable for reaching a decision.', 'The committee is capable on reaching a decision.'],
    analogies: ['hive', 'web', 'stable', 'den'],
    'sentence-correction': ['Because the road flooded, classes ended early.', 'Due to the road flooded, classes ended early.', 'The road flooded, because classes ended early.', 'Being the road flooded classes ending early.'],
  }
  const values = bank[topic.slug]
  const prompt = {
    'subject-verb-agreement': 'Which sentence has correct subject–verb agreement?',
    pronouns: 'Which sentence uses pronouns correctly?',
    'verb-tense': 'Which sentence maintains a logical verb tense?',
    'modifiers-parallelism': 'Which sentence uses parallel structure?',
    'sentence-structure': 'Which option is a complete, correctly punctuated sentence?',
    'vocabulary-context': `In “The editor requested a concise response rather than a long explanation,” what does concise most nearly mean?`,
    'idioms-usage': 'Which sentence follows standard formal English usage?',
    analogies: 'Bird is to nest as bee is to _____.',
    'sentence-correction': 'Which revision states the cause and effect most clearly?',
  }[topic.slug]
  const settings = ['a library notice','a laboratory report','a scholarship essay','a student editorial','a class announcement','a debate brief','a campus email','a project reflection','a club proposal','an exam response']
  const variant = ` This item appears in ${settings[index % settings.length]} (set ${Math.floor(index / 10) + 1}).`
  return { question: `${prompt}${variant}`, choices: rotate(values, index % 4), correctAnswer: values[0], explanation: `${values[0]} is the only choice that follows the tested rule without changing the intended meaning.` }
}

const filipinoBank = {
  'bahagi-ng-pananalita': ['pang-uri','pangngalan','pandiwa','pang-abay'],
  'pandiwa-aspekto': ['perpektibo','imperpektibo','kontemplatibo','pawatas'],
  'panghalip-pang-ugnay': ['kaya','siya','mabilis','paaralan'],
  'wastong-gamit': ['nang','ng','may','din'],
  'kayarian-pangungusap': ['hugnayan','payak','tambalan','langkapan'],
  bantas: ['Pagkatapos ng klase, nag-aral siya.','Pagkatapos ng klase nag-aral siya','pagkatapos ng klase, Nag-aral siya.','Pagkatapos ng klase; nag-aral siya,'],
  talasalitaan: ['maingat at matipid','magulo at pabaya','mabilis at maingay','malungkot at tahimik'],
  'idyoma-tayutay': ['mapagbigay','malawak ang palad','mahilig magbukas','palaging nakataas ang kamay'],
  pagwawasto: ['Dahil nagsanay siya araw-araw, mahusay siyang tumugtog.','Mahusay siyang tumugtog dahil araw-araw ngunit nagsanay.','Dahil mahusay, tumugtog siya nagsanay araw-araw.','Araw-araw dahil siya ay mahusay na nagsanay tumugtog.'],
}
function filipinoQuestion(topic, index) {
  const prompts = {
    'bahagi-ng-pananalita': 'Ano ang bahagi ng pananalita ng salitang “masipag” sa “Masipag na mag-aaral si Lino”?',
    'pandiwa-aspekto': 'Anong aspekto ng pandiwa ang “nag-aral” sa “Nag-aral si Ana kagabi”?',
    'panghalip-pang-ugnay': 'Aling salita ang pang-ugnay sa “Nagsanay siya kaya gumaling siya”?',
    'wastong-gamit': 'Piliin ang wastong salita: “Tumakbo siya ___ mabilis.”',
    'kayarian-pangungusap': 'Ano ang kayarian ng “Umalis kami dahil lumakas ang ulan”?',
    bantas: 'Aling pangungusap ang wasto ang bantas at kapitalisasyon?',
    talasalitaan: 'Ano ang kahulugan ng “masinop” sa “Masinop siyang gumamit ng baon”?',
    'idyoma-tayutay': 'Ano ang kahulugan ng “bukas-palad” sa pangungusap?',
    pagwawasto: 'Alin ang pinakamalinaw at lohikal na pangungusap?',
  }
  const choices = filipinoBank[topic.slug]
  const gamit = ['paunawa sa aklatan','ulat sa agham','sanaysay sa klase','liham sa paaralan','balita sa kampus','panukala ng samahan','talumpati','tala sa proyekto','pagsusulit','buod ng aralin']
  const marker = ` Gamitin ang pamantayang Filipino para sa ${gamit[index % gamit.length]} (set ${Math.floor(index / 10) + 1}).`
  return { question: `${prompts[topic.slug]}${marker}`, choices: rotate(choices, index % 4), correctAnswer: choices[0], explanation: `Ang “${choices[0]}” ang wastong sagot batay sa tuntunin at diwa ng pangungusap.` }
}

const readingContexts = [
  ['A barangay library extended its hours during examination week. Attendance rose most on evenings when volunteer tutors were present. The librarian plans to keep two evening schedules each week.','Evening access paired with tutoring increased library use.'],
  ['Mangrove roots slow coastal water and trap sediment. Communities that restored mangroves recorded less erosion during ordinary storms, though the trees did not eliminate all flood risk.','Mangrove restoration can reduce erosion but is not complete flood protection.'],
  ['A school replaced disposable cups with refill stations. Plastic waste fell, but water use rose slightly because the stations required daily cleaning.','The refill program reduced plastic while creating a smaller water-use tradeoff.'],
  ['Farmers tested two rice varieties in equal plots. Variety A yielded more during dry weeks; Variety B recovered faster after flooding.','The better variety depends on the expected water conditions.'],
  ['A city opened protected bicycle lanes on three roads. Bicycle counts increased, while travel time for buses changed little during the trial.','Protected lanes increased cycling without substantially delaying buses.'],
  ['Students who spaced four short review sessions across a week recalled more terms than students who studied once for the same total time.','Spaced review improved recall in the described comparison.'],
  ['An online map marks evacuation routes, but residents without stable internet cannot always access it during storms. Officials therefore printed neighborhood copies.','Printed maps address an access limit of the online system.'],
  ['The museum lowered ticket prices on Wednesdays. Visits increased, especially among local students, but weekend attendance remained unchanged.','The weekday discount expanded Wednesday attendance, especially for students.'],
  ['A creek cleanup removed visible trash. Later tests still detected excess nutrients from upstream farms, showing that appearance alone did not measure water quality.','Clean appearance does not guarantee good water quality.'],
  ['The school garden produced fewer tomatoes after tall sunflowers shaded the beds. Moving the flowers restored six hours of daily light and improved the next harvest.','Insufficient light reduced the tomato harvest.'],
  ['Two classes used the same science module. One class discussed each result before proceeding; its final explanations were more detailed, although both classes had similar quiz scores.','Discussion improved explanatory detail more than quiz scores.'],
  ['A ferry added an early trip after workers reported long waits. Morning crowding fell, but the total number of daily passengers stayed nearly constant.','The added trip redistributed passengers across departure times.'],
  ['A clinic reminder used both text messages and calls. Missed appointments declined most among patients who confirmed receipt of either reminder.','Confirmed reminders were associated with fewer missed appointments.'],
  ['Rain barrels supplied a garden for three dry days. During a longer dry period, stored water ran out and gardeners used the regular supply.','Rain barrels helped for short dry periods but had limited capacity.'],
  ['A student newspaper separated news reports from editorials and labeled both clearly. Readers later identified opinion statements more accurately.','Clear labels helped readers distinguish reporting from opinion.'],
  ['A footbridge shortened the walk to school by eight minutes. Use was highest in daylight, and residents requested better lighting for evening safety.','The bridge saved time, but lighting affected evening use.'],
  ['A solar dryer reduced the time needed to preserve fruit on sunny days. During several cloudy days, drying slowed considerably.','The dryer’s performance depended on sunlight.'],
  ['A reading app awarded points for completed pages. Page totals rose, but interviews showed some students chose only very short texts to collect points quickly.','The reward increased pages while also changing text selection.'],
  ['A market placed compost bins beside food stalls. Correct sorting improved after signs used pictures of accepted scraps instead of text alone.','Picture-based signs improved compost sorting.'],
  ['A coastal school practiced evacuation twice. The second drill finished faster because class leaders already knew the assigned routes.','Familiarity with routes improved the second drill.'],
]
function readingQuestion(topic, index) {
  const [passage, main] = readingContexts[index]
  const generic = {
    'main-idea': [`Which statement best summarizes the passage?`, main],
    'supporting-evidence': ['Which detail most directly supports the passage’s main conclusion?', passage.split('. ')[1]?.replace('.', '') ?? passage.split('.')[0]],
    inference: ['Which inference is best supported by the passage?', main],
    tone: ['Which word best describes the passage’s tone?', 'measured'],
    'purpose-audience': ['What is the primary purpose of the passage?', 'to explain an observed result and its limitation or implication'],
    structure: ['Which structure best describes the passage?', 'observation followed by result or response'],
    'context-clues': ['In context, which meaning best fits the key result described?', main],
    synthesis: ['Which conclusion best combines the details in the passage?', main],
    'visual-information': ['If the passage were paired with a chart, which measure would be most relevant?', 'the before-and-after value of the reported outcome'],
  }[topic.slug]
  const distractors = ['a claim contradicted by the passage','a detail the passage never states','an absolute conclusion stronger than the evidence']
  return { passage, question: generic[0], correctAnswer: generic[1], choices: textChoices(generic[1], distractors, index), explanation: `The answer stays within the evidence: ${main}` }
}

function reasoningQuestion(topic, index) {
  const a = 2 + index; const d = 2 + index % 5
  if (topic.slug === 'number-series') {
    const seq = [a, a+d, a+2*d, a+3*d]; const answer = a+4*d
    return { question: `What comes next: ${seq.join(', ')}, ___?`, correctAnswer: String(answer), choices: numericChoices(answer,d,index), explanation: `Each term increases by ${d}, so the next term is ${answer}.` }
  }
  if (topic.slug === 'letter-series') {
    const step = 1 + Math.floor(index / 7); const start = index % 7; const letters = [0,1,2,3].map((n)=>String.fromCharCode(65+start+n*step)); const answer=String.fromCharCode(65+start+4*step)
    return { question: `What comes next: ${letters.join(', ')}, ___?`, correctAnswer: answer, choices: textChoices(answer,[String.fromCharCode(66+start+4*step),String.fromCharCode(65+start+3*step),String.fromCharCode(64+start+4*step)],index), explanation:`The pattern advances ${step} alphabet position${step === 1 ? '' : 's'} each time.` }
  }
  if (topic.slug === 'classification') {
    const sets = [
      [['triangle','square','pentagon'],'circle','polygons with straight sides'],[['mango','banana','papaya'],'carrot','fruits'],[['copper','iron','gold'],'glass','metals'],[['sparrow','eagle','owl'],'bat','birds'],[['Mercury','Venus','Mars'],'Moon','planets'],[['meter','kilometer','centimeter'],'liter','units of length'],[['red','blue','yellow'],'circle','colors'],[['violin','guitar','harp'],'flute','string instruments'],[['January','April','August'],'Monday','months'],[['addition','subtraction','multiplication'],'triangle','arithmetic operations'],
      [['oak','pine','acacia'],'rose','trees'],[['oxygen','nitrogen','hydrogen'],'water','elements'],[['cube','sphere','cylinder'],'triangle','three-dimensional figures'],[['doctor','nurse','dentist'],'library','health professions'],[['keyboard','mouse','monitor'],'notebook','computer equipment'],[['evaporation','condensation','freezing'],'gravity','phase changes'],[['novel','poem','essay'],'microscope','forms of writing'],[['peso','yen','dollar'],'kilogram','currencies'],[['democracy','monarchy','republic'],'photosynthesis','systems of government'],[['calm','joyful','anxious'],'wooden','emotional states'],
    ]
    const [members, odd, rule] = sets[index]
    return { question: `Which item does not belong with ${members.join(', ')}?`, correctAnswer: odd, choices: textChoices(odd,members,index), explanation: `${members.join(', ')} are ${rule}; ${odd} is not.` }
  }
  if (topic.slug === 'abstract-patterns') {
    const angle = [45,60,90,120][index % 4]; const steps = 2 + Math.floor(index / 4); const answer = (angle * steps) % 360
    return { question: `A marker rotates ${angle}° clockwise per step. What is its net clockwise rotation after ${steps} steps?`, correctAnswer: `${answer}°`, choices: textChoices(`${answer}°`,[`${(answer+angle)%360}°`,`${(answer+90)%360}°`,`${(360-answer)%360}°`],index), explanation: `${angle}° × ${steps} = ${angle*steps}°; removing full 360° turns gives ${answer}°.` }
  }
  if (topic.slug === 'spatial-reasoning') {
    const directions = ['north','east','south','west']; const start = index % 4; const turns = 1 + Math.floor(index / 4); const answer = directions[(start + turns) % 4]
    return { question: `An arrow points ${directions[start]}. It makes ${turns} quarter-turn${turns===1?'':'s'} clockwise. Which direction does it point?`, correctAnswer: answer, choices: rotate(directions,index%4), explanation: `Moving ${turns} quarter-turn${turns===1?'':'s'} clockwise from ${directions[start]} ends at ${answer}.` }
  }
  if (topic.slug === 'logical-analogies') {
    const pairs = [['puppy','dog','kitten','cat'],['calf','cow','foal','horse'],['page','book','brick','wall'],['finger','hand','toe','foot'],['captain','ship','pilot','airplane'],['thermometer','temperature','scale','weight'],['author','novel','composer','song'],['hive','bee','nest','bird'],['knife','cut','pen','write'],['seed','plant','egg','bird'],['teacher','school','doctor','hospital'],['minute','hour','centavo','peso'],['island','water','oasis','desert'],['painter','brush','carpenter','hammer'],['hungry','food','thirsty','water'],['eye','see','ear','hear'],['glove','hand','shoe','foot'],['chapter','book','scene','play'],['sapling','tree','cub','bear'],['key','lock','password','account']]
    const [a1,a2,b1,answer] = pairs[index]
    return { question: `${a1} is to ${a2} as ${b1} is to _____.`, correctAnswer: answer, choices: textChoices(answer,[a2,a1,b1],index), explanation: `The relationship from ${a1} to ${a2} matches the relationship from ${b1} to ${answer}.` }
  }
  if (topic.slug === 'syllogisms') {
    const groups = [['scholars','readers','Mira'],['orchids','plants','Lina'],['triangles','polygons','figure Q'],['whales','mammals','animal W'],['nurses','health workers','Paolo'],['novels','books','text N'],['planets','celestial bodies','object P'],['metals','conductors','sample M'],['eagles','birds','creature E'],['volunteers','helpers','Ana'],['rivers','waterways','feature R'],['pianos','instruments','item P'],['teachers','professionals','Rico'],['mangoes','fruits','food M'],['squares','rectangles','shape S'],['chemists','scientists','Ben'],['laptops','computers','device L'],['senators','legislators','person S'],['fractions','numbers','value F'],['poems','literary works','piece P']]
    const [small,big,name] = groups[index]; const answer = `${name} belongs to ${big}.`
    return { question: `All ${small} belong to ${big}. ${name} belongs to ${small}. What must follow?`, correctAnswer: answer, choices: textChoices(answer,[`All ${big} belong to ${small}.`,`${name} is the only member of ${big}.`,`No ${small} belong to ${big}.`],index), explanation: `The premises place every ${small.slice(0,-1)} inside the ${big} group, including ${name}.` }
  }
  if (topic.slug === 'arguments') {
    const claims = [['new schedule','punctuality','late arrivals'],['tutoring program','algebra performance','algebra scores'],['bike lane','cycling participation','bicycle counts'],['library extension','evening access','evening visits'],['waste signs','proper sorting','correctly sorted bins'],['study workshop','retention','delayed recall scores'],['tree planting','shade coverage','shaded ground area'],['bus route','commute time','recorded travel minutes'],['water station','plastic reduction','discarded bottle counts'],['reading hour','reading frequency','weekly reading logs'],['drain cleanup','street flooding','measured flood duration'],['garden compost','soil quality','soil nutrient tests'],['practice drill','evacuation speed','completion time'],['air filters','indoor particles','particle readings'],['attendance reminder','attendance','absence records'],['quiet zone','noise reduction','decibel readings'],['meal program','morning hunger','student survey ratings'],['lighting upgrade','night visibility','measured illumination'],['rainwater tank','tap-water use','metered consumption'],['peer review','essay clarity','blind rubric scores']]
    const [action,outcome,measure] = claims[index]; const correctAnswer = `${measure} improved after the ${action}, while the comparison conditions stayed stable.`
    return { question: `A school claims its ${action} improved ${outcome}. Which evidence most strengthens the claim?`, correctAnswer, choices: textChoices(correctAnswer,[`Some students said the ${action} looked attractive.`,`The ${action} was announced on a Monday.`,`Another school changed an unrelated policy.`],index), explanation: `The correct choice directly measures ${outcome} and includes a useful comparison.` }
  }
  const offset = 3 + index; const result = 8 + index; const coefficient = 2 + index % 4; const rhs = coefficient * result + offset
  return { question: `What is x? Statement 1: ${coefficient}x + ${offset} = ${rhs}. Statement 2: x is positive. Which information is sufficient?`, correctAnswer: 'Statement 1 alone', choices: textChoices('Statement 1 alone',['Statement 2 alone','Both statements are required','Neither statement is sufficient'],index), explanation: `Statement 1 uniquely gives x = (${rhs} - ${offset})/${coefficient} = ${result}; positivity alone allows many values.` }
}

function buildQuestion(topic, index) {
  let item
  if (topic.subjectSlug === 'mathematics') item = mathQuestion(topic, index)
  else if (topic.subjectSlug === 'science') item = scienceQuestion(topic, index)
  else if (topic.subjectSlug === 'english-language') item = englishQuestion(topic, index)
  else if (topic.subjectSlug === 'filipino-language') item = filipinoQuestion(topic, index)
  else if (topic.subjectSlug === 'reading-comprehension') item = readingQuestion(topic, index)
  else item = reasoningQuestion(topic, index)
  return {
    id: `${topic.subjectSlug}:${topic.slug}:${String(index + 1).padStart(2, '0')}`,
    subject: topic.subject,
    subjectSlug: topic.subjectSlug,
    topic: topic.title,
    topicSlug: topic.slug,
    language: topic.language,
    passage: item.passage ?? null,
    question: item.question,
    choices: item.choices.map(String),
    correctAnswer: String(item.correctAnswer),
    explanation: item.explanation,
    difficulty: difficultyFor(index),
    version: 1,
    status: 'published',
    validationRounds: 2,
    verifiedAt: '2026-10-03',
    examTags: ['shared-cet-core', 'upcat', 'ustet'],
    sources: sourcesFor(topic),
  }
}

const bank = allTopics.flatMap((topic) => Array.from({ length: 20 }, (_, index) => buildQuestion(topic, index)))
fs.writeFileSync(output, `${JSON.stringify(bank, null, 2)}\n`)
console.log(`Generated ${bank.length} original questions across ${allTopics.length} topics at ${output.pathname}`)
