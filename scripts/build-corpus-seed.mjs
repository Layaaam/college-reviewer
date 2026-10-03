import fs from 'node:fs'

const audit = JSON.parse(fs.readFileSync(new URL('../docs/source-corpus-audit.json', import.meta.url), 'utf8'))
const destination = new URL('../supabase/seed/004_source_corpus_metadata.sql', import.meta.url)
const q = (value) => value === null || value === undefined ? 'null' : `'${String(value).replaceAll("'", "''")}'`
const json = (value) => `${q(JSON.stringify(value))}::jsonb`
const array = (values) => `array[${values.map(q).join(',')}]::text[]`
const lines = [
  '-- Generated from docs/source-corpus-audit.json. Metadata only; no reviewer file contents are uploaded.',
  'begin;',
]
for (const item of audit.files.filter((file) => file.is_canonical)) {
  const title = item.canonical_path.split('/').at(-1)
  lines.push(`insert into public.source_artifacts(source_key,title,local_checksum,canonical_path,duplicate_paths,format,page_count,extraction_quality,publication_date,apparent_publisher,reuse_status,subjects,topics,notes) values(${q(`corpus:${item.sha256}`)},${q(title)},${q(item.sha256)},${q(item.canonical_path)},${json(item.duplicate_paths ?? [])},${q(item.format)},${item.page_count ?? 'null'},${q(item.extraction_quality)},${q(item.publication_date)},${q(item.apparent_publisher)},${q(item.reuse_status)},${array(item.subjects ?? [])},${array(item.topics ?? [])},${q(item.notes ?? 'Filename-assisted classification; use for coverage only unless independently authoritative.')}) on conflict(source_key) do update set title=excluded.title,local_checksum=excluded.local_checksum,canonical_path=excluded.canonical_path,duplicate_paths=excluded.duplicate_paths,format=excluded.format,page_count=excluded.page_count,extraction_quality=excluded.extraction_quality,publication_date=excluded.publication_date,apparent_publisher=excluded.apparent_publisher,reuse_status=excluded.reuse_status,subjects=excluded.subjects,topics=excluded.topics,notes=excluded.notes;`)
}
lines.push('commit;', '')
fs.writeFileSync(destination, lines.join('\n'))
console.log(`Generated metadata seed for ${audit.files.filter((file) => file.is_canonical).length} canonical corpus artifacts.`)
