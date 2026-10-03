# College Reviewer

Focused college entrance exam review for senior high school students. The app uses React, TypeScript, Vite, Tailwind CSS, React Router, Supabase Auth/Postgres, Vitest, React Testing Library, and Playwright.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

With Supabase variables configured, the app uses real email/password sessions, database profile roles, and persisted learning data. Without variables, Vite development mode permits a limited demo sign-in for local UI work. Production builds without Supabase configuration fail closed.

## Verification

```powershell
npm run lint
npm run test
npm run build
npm run test:e2e
```

The E2E suite runs public route checks without credentials. To also test live student and admin accounts, set `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`, `E2E_ADMIN_EMAIL`, and `E2E_ADMIN_PASSWORD` in your local shell before running `npm run test:e2e`. Do not commit credentials.

Practice quizzes show a 10-minute countdown. The countdown resumes from the same start time after a refresh. When it reaches zero, students can still submit their saved answers manually.

Apply `supabase/migrations/001_initial_schema.sql` to a Supabase project. Only the public URL and anon key belong in Vite environment variables; never expose a service-role key.
