# CET content seeds

Run the schema migrations in numeric order, then generate the content files with `npm run seed:content`, `npm run seed:lessons`, and `npm run audit:corpus`.

Apply the generated seeds in this order:

1. `003_cet_content.sql` — 60 topics and 1,200 validated questions.
2. `004_source_corpus_metadata.sql` — deduplicated, metadata-only source inventory.
3. `005_deep_lessons.sql` — 60 teach-first lessons with concepts, methods, worked solutions, mistakes, strategies, quick checks, and official references.

Run `supabase/tests/quiz_contract.sql` after all three seeds. It validates both the question publication gate and the structured lesson gate.

The local `pdfs/` directory is intentionally ignored and must never be uploaded to production storage. `docs/source-corpus-audit.json` records checksums and canonical mappings without copying the source files.
