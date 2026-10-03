import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve('pdfs')
const docs = path.resolve('docs')
const bundledPdfInfo = process.platform === 'win32' ? path.join(process.env.USERPROFILE ?? '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'native', 'poppler', 'Library', 'bin', 'pdfinfo.exe') : 'pdfinfo'
const pdfInfoCommand = fs.existsSync(bundledPdfInfo) ? bundledPdfInfo : (process.platform === 'win32' ? 'pdfinfo.exe' : 'pdfinfo')
if (!fs.existsSync(root)) throw new Error(`Corpus directory not found: ${root}`)
const files = []
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(full)
    else files.push(full)
  }
}
visit(root)
const sampleResult = spawnSync(process.platform === 'win32' ? 'python.exe' : 'python3', [path.resolve('scripts/sample-pdf-text.py'), root], { encoding: 'utf8', windowsHide: true, maxBuffer: 20_000_000 })
const pdfSamples = sampleResult.status === 0 ? JSON.parse(sampleResult.stdout) : {}

const hashFile = (file) => {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(file))
  return hash.digest('hex')
}
const subjectTags = (relative) => {
  const text = relative.toLowerCase(); const tags = []
  const rules = [['Mathematics',/math|algebra|geometry|trigon|statistic|probability/],['Science',/science|biology|chemistry|physics|earth|astronomy|environment/],['English Language',/english|grammar|vocabulary|language proficiency/],['Filipino Language',/filipino|tagalog|wika/],['Reading Comprehension',/reading|comprehension/],['Mental and Logical Reasoning',/reasoning|logic|abstract|mental|mensa/]]
  for (const [name, pattern] of rules) if (pattern.test(text)) tags.push(name)
  return tags
}
const classify = (relative, extension, size) => {
  const name = relative.toLowerCase()
  if (size < 1024 || /\.crdownload$|\.part$|incomplete|corrupt/.test(name)) return 'unusable'
  if (/answer.?key|answers only/.test(name)) return 'answer-key-only'
  if (/schedule|application|requirement|scholarship|financial aid/.test(name)) return 'stale-guidance'
  if (/research paper|apa|religion|bible|thesis/.test(name)) return 'out-of-scope'
  if (/official|deped|curriculum|upcat reviewer 2018/.test(name)) return 'authoritative-reference'
  if (['.pdf','.doc','.docx','.ppt','.pptx','.xls','.xlsx','.odt'].includes(extension)) return 'coverage-reference'
  return 'out-of-scope'
}
const pageCount = (file, extension) => {
  if (extension !== '.pdf') return null
  const result = spawnSync(pdfInfoCommand, [file], { encoding: 'utf8', windowsHide: true })
  if (result.status !== 0) return null
  const match = result.stdout.match(/^Pages:\s+(\d+)/m)
  return match ? Number(match[1]) : null
}
const extractionQuality = (relative, extension, pages) => {
  if (extension !== '.pdf') return 'not-applicable'
  if (pages === null) return 'unparseable'
  const charsPerPage = pdfSamples[relative]?.sample_chars_per_page
  if (charsPerPage === undefined || charsPerPage === null) return 'not-text-sampled'
  return charsPerPage < 120 ? 'image-heavy-ocr-required' : charsPerPage < 500 ? 'low-text-review' : 'extractable-text'
}

const records = files.sort().map((file) => {
  const stat = fs.statSync(file); const relative = path.relative(root, file).replaceAll('\\','/'); const extension = path.extname(file).toLowerCase()
  const pages = pageCount(file, extension)
  return { relative_path: relative, sha256: hashFile(file), size_bytes: stat.size, format: extension.slice(1) || 'unknown', page_count: pages, extraction_quality: extractionQuality(relative, extension, pages), publication_date: null, apparent_publisher: null, subjects: subjectTags(relative), topics: [], reuse_status: classify(relative, extension, stat.size), notes: 'Filename-assisted classification; use for coverage only unless independently authoritative.' }
})
const groups = new Map()
for (const record of records) groups.set(record.sha256, [...(groups.get(record.sha256) ?? []), record])
const inventory = records.map((record) => {
  const family = groups.get(record.sha256)
  const canonical = family.map((item) => item.relative_path).sort((a,b) => a.length-b.length || a.localeCompare(b))[0]
  return { ...record, canonical_path: canonical, duplicate_paths: family.filter((item) => item.relative_path !== canonical).map((item) => item.relative_path), is_canonical: record.relative_path === canonical }
})
const exactDuplicateGroups = [...groups.values()].filter((items) => items.length > 1)
const canonical = inventory.filter((item) => item.is_canonical)
const summary = {
  generated_at: new Date().toISOString(),
  corpus_root: 'pdfs/ (local only; excluded from production)',
  total_files: inventory.length,
  formats: Object.fromEntries([...new Set(inventory.map((item) => item.format))].sort().map((format) => [format, inventory.filter((item) => item.format === format).length])),
  exact_duplicate_groups: exactDuplicateGroups.length,
  redundant_exact_copies: exactDuplicateGroups.reduce((sum, items) => sum + items.length - 1, 0),
  canonical_files: canonical.length,
  unique_pdfs: canonical.filter((item) => item.format === 'pdf').length,
  canonical_pdf_pages: canonical.filter((item) => item.format === 'pdf').reduce((sum, item) => sum + (item.page_count ?? 0), 0),
  unparseable_pdfs: canonical.filter((item) => item.format === 'pdf' && item.page_count === null).length,
  image_heavy_pdfs: canonical.filter((item) => item.format === 'pdf' && item.extraction_quality === 'image-heavy-ocr-required').length,
  classifications: Object.fromEntries(['coverage-reference','authoritative-reference','answer-key-only','stale-guidance','out-of-scope','unusable'].map((status) => [status, canonical.filter((item) => item.reuse_status === status).length])),
}
fs.mkdirSync(docs, { recursive: true })
fs.writeFileSync(path.join(docs,'source-corpus-audit.json'), `${JSON.stringify({ summary, files: inventory }, null, 2)}\n`)
const markdown = `# Source corpus audit\n\nGenerated: ${summary.generated_at}\n\nThe local corpus is a read-only coverage reference. Commercial or private wording is not copied into the question bank.\n\n| Measure | Count |\n|---|---:|\n| Files | ${summary.total_files} |\n| Canonical files after exact deduplication | ${summary.canonical_files} |\n| Exact duplicate families | ${summary.exact_duplicate_groups} |\n| Redundant exact copies | ${summary.redundant_exact_copies} |\n| Unique PDFs | ${summary.unique_pdfs} |\n| PDF pages detected | ${summary.canonical_pdf_pages} |\n| PDFs requiring repair/tool review | ${summary.unparseable_pdfs} |\n| Image-heavy PDFs requiring OCR | ${summary.image_heavy_pdfs} |\n\n## Reuse classification\n\n${Object.entries(summary.classifications).map(([key,value]) => `- ${key}: ${value}`).join('\n')}\n\nThe complete canonical mappings, checksums, duplicate paths, formats, page counts, subject tags, and classification decisions are in [source-corpus-audit.json](./source-corpus-audit.json). Text-level and item-level candidate review is recorded separately; classification is conservative and filename-assisted, so uncertain records remain coverage references rather than answer authority.\n`
fs.writeFileSync(path.join(docs,'source-corpus-audit.md'), markdown)
console.log(JSON.stringify(summary, null, 2))
