-- Run after 001_initial_schema.sql. Safe to run more than once.
insert into public.subjects (name, slug, description, sort_order)
values
  ('Mathematics', 'mathematics', 'Numbers, algebra, and problem solving.', 1),
  ('English', 'english', 'Grammar, vocabulary, and clear writing.', 2),
  ('Science', 'science', 'Biology, chemistry, physics, and scientific thinking.', 3),
  ('Reading Comprehension', 'reading-comprehension', 'Understand passages, evidence, and main ideas.', 4),
  ('General Knowledge', 'general-knowledge', 'Core facts and ideas across everyday subjects.', 5)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order;

insert into public.lessons (subject_id, title, content, sort_order)
select s.id, v.title, v.content, 1
from (values
  ('mathematics', 'Algebraic expressions', 'Concept summary: An algebraic expression combines numbers, variables, and operations. Important rule: Apply the same operation to both sides of an equation. Worked example: For 3x + 5 = 20, subtract 5 to get 3x = 15, then divide by 3 to get x = 5.'),
  ('english', 'Clear sentences', 'Concept summary: A clear sentence has a subject and a verb that agree. Important rule: A singular subject normally takes a singular verb. Worked example: "The list of names is long" uses is because list is singular.'),
  ('science', 'Cells and energy', 'Concept summary: Cells are the basic units of life and use energy to work. Important rule: Plants use light, water, and carbon dioxide to make glucose. Worked example: In photosynthesis, a leaf absorbs light while taking in carbon dioxide from the air.'),
  ('reading-comprehension', 'Main ideas and evidence', 'Concept summary: The main idea is what a passage is mostly about. Important rule: Support an interpretation with details from the text. Worked example: If a passage lists ways trees cool a city, its main idea may be that trees reduce urban heat.'),
  ('general-knowledge', 'Checking facts', 'Concept summary: General knowledge covers geography, civics, history, and everyday science. Important rule: Prefer facts that can be checked with reliable sources. Worked example: A map or official reference can confirm that Manila is the capital of the Philippines.')
) as v(slug, title, content)
join public.subjects s on s.slug = v.slug
where not exists (
  select 1 from public.lessons existing
  where existing.subject_id = s.id and existing.title = v.title
);
