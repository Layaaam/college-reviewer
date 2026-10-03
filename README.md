# College Reviewer

Focused college entrance exam review for senior high school students. The app uses React, TypeScript, Vite, Tailwind CSS, React Router, Supabase Auth/Postgres, Vitest, React Testing Library, and Playwright.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

With Supabase variables configured, the app uses real email/password sessions, database profile roles, and persisted learning data. Without variables, Vite development mode permits a limited demo sign-in for local UI work. Production builds without Supabase configuration fail closed.

## Content and corpus pipeline

The production bank contains 60 lessons and 1,200 original questions across Mathematics, Science, English Language, Filipino Language, Reading Comprehension, and Mental and Logical Reasoning. The local `pdfs/` corpus is checksum-audited and ignored by Git; only provenance metadata is retained.

```powershell
npm run audit:corpus
npm run seed:content
npm run seed:lessons
```

Apply the migrations in numeric order through `004_deep_lessons.sql`, then execute the generated seeds in numeric order through `005_deep_lessons.sql`. The content commands regenerate the JSON bank, enforce the publication gate, and build the question, corpus-metadata, and structured-lesson SQL files.

Review is teach-first: Subject → Topic → Lesson → Practice. Every topic lesson includes an overview, objectives, core concepts, a repeatable solution method, three worked examples, common errors, CET strategies, quick checks, and authoritative scope references. Legacy one-paragraph lessons are archived rather than shown to students.

## Verification

```powershell
npm run lint
npm run test
npm run build
npm run test:e2e
```

The E2E suite runs public route checks without credentials. To also test live student and admin accounts, set `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`, `E2E_ADMIN_EMAIL`, and `E2E_ADMIN_PASSWORD` in your local shell before running `npm run test:e2e`. Do not commit credentials.

Topic practice and subject quizzes are untimed. Subject exams use a 60-minute server deadline; the 100-question general exam uses 120 minutes. Drafts are stored server-side, timed modes auto-submit, and completed results reveal answers through ownership-checked RPCs. Only the public URL and anon key belong in Vite environment variables; never expose a service-role key.
