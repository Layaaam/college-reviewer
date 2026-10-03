# College Reviewer Website — Revised Implementation Plan

## Summary

Build a focused college entrance exam reviewer for senior high school students.

Students will be able to:

- Sign in using an account provided by the administrator
- Review short lessons
- Take multiple-choice quizzes
- See answer explanations
- Review mistakes
- Track subject progress

The administrator will have a protected, read-only dashboard for checking student progress.

The attached image is treated only as a visual reference. Its task-management content, labels, and data are not requirements for this project.

Design workflow selected: implement directly in React using the image as UI inspiration. No Figma file is required. If a formal Figma workflow is requested later, the relevant skills are `figma-design-to-code` and `figma-use`.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide React
- Supabase Auth
- Supabase PostgreSQL
- Vercel free hosting
- Vitest
- React Testing Library
- Playwright

Use shadcn/ui for:

- Buttons
- Cards
- Badges
- Progress bars
- Tables
- Tabs
- Dialogs
- Inputs
- Dropdown menus
- Avatars
- Alerts
- Skeleton loaders
- Toast notifications

## Phase 0 — Create and Configure the Project

Run inside `C:\react\college-reviewer`:

```powershell
npm create vite@latest . -- --template react-ts
npm install

npm install react-router-dom @supabase/supabase-js lucide-react clsx tailwind-merge

npm install -D tailwindcss @tailwindcss/vite prettier vitest `
  @testing-library/react @testing-library/jest-dom `
  @testing-library/user-event jsdom @playwright/test

npx shadcn@latest init
npx shadcn@latest add button card badge progress input table tabs dialog dropdown-menu avatar separator skeleton alert sonner
```

Configure:

- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- `@/*` import aliases
- ESLint
- Prettier
- Vitest
- Playwright

Create:

```text
src/
  components/
  components/ui/
  data/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  types/
  App.tsx
  main.tsx

supabase/
  migrations/
  seed/

.env.example
README.md
```

Create `.env.example`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Supabase service-role key must never be included in frontend code.

## Phase 1 — UI/UX Foundation

Use the attached dashboard as visual inspiration while adapting it to an education product.

### Visual direction

- No gradients anywhere
- White and soft-gray page surfaces
- Deep green as the primary accent
- Pale green for selected and successful states
- Near-black text for headings
- Muted gray text for supporting information
- Thin borders
- Subtle shadows
- Rounded cards and controls
- Consistent spacing
- Clear visual hierarchy
- Calm, academic, encouraging tone

Suggested palette:

```text
Primary green: #146C4B
Dark green: #0E4D38
Soft green: #E8F3ED
Page background: #F6F7F6
Card background: #FFFFFF
Main text: #151817
Muted text: #737A76
Border: #E2E7E4
Success: #2E8B57
Warning: #B7791F
Error: #C94B4B
```

Do not use:

- CSS gradients
- Gradient backgrounds
- Excessive decorative illustrations
- Neon colors
- Glassmorphism
- Excessive animations
- Dense information walls

### Layout

Desktop layout:

- Left sidebar
- Compact top header
- Main content area
- Responsive right-side content only when useful

Sidebar items:

```text
Dashboard
Review
Practice
Mistakes
Progress
```

Bottom sidebar section:

```text
Settings
Help
Logout
```

Header elements:

- Search field
- Notifications icon
- Student avatar
- Student name and email
- Mobile menu trigger

Mobile layout:

- Collapsible sidebar
- Bottom navigation or compact menu
- Single-column cards
- Large touch targets
- No horizontal scrolling
- Quiz interface optimized for phones

### UX principles

- One obvious primary action per screen
- Use plain student-friendly language
- Show progress without overwhelming the user
- Preserve quiz answers during temporary network failures
- Always show loading, empty, and error states
- Use confirmation dialogs only for destructive or irreversible actions
- Keep lessons short and scannable
- Make explanations more prominent than decorative statistics

## Phase 2 — Application Routes and Shell

Create:

```text
/
 /login
 /dashboard
 /review
 /review/:subject
 /practice
 /practice/:subject
 /quiz/:quizId
 /results/:attemptId
 /mistakes
 /progress
 /admin
 /admin/students/:studentId
```

Rules:

- Unauthenticated users are redirected to `/login`.
- Students cannot access `/admin`.
- Admins can access the admin dashboard.
- Unknown routes show a friendly not-found page.
- Route loading states use shadcn skeleton components.

## Phase 3 — Authentication

Use Supabase Auth with email and password.

Account behavior:

- Student accounts are created or invited through Supabase administration tools.
- Public self-registration is excluded from the MVP.
- Students log in with the credentials provided to them.
- Password reset is supported.
- Logout is available from the account menu.
- The current profile is loaded after authentication.

Roles:

```text
student
admin
```

The role must be stored and enforced through the database, not trusted only from frontend state.

## Phase 4 — Database and Security

Create these tables:

### profiles

```text
id
email
full_name
role
created_at
```

### subjects

```text
id
name
slug
description
sort_order
```

### lessons

```text
id
subject_id
title
content
sort_order
created_at
```

### questions

```text
id
subject_id
lesson_id
question_text
explanation
difficulty
created_at
```

### question_choices

```text
id
question_id
choice_text
is_correct
sort_order
```

### quiz_attempts

```text
id
student_id
subject_id
score
total_questions
started_at
completed_at
```

### quiz_answers

```text
id
attempt_id
question_id
selected_choice_id
is_correct
```

### student_progress

```text
id
student_id
subject_id
questions_answered
correct_answers
accuracy
last_activity
```

Row Level Security requirements:

- Students can read subjects, lessons, questions, and choices.
- Students can read and create only their own attempts.
- Students can read and create only their own answers.
- Students can read only their own progress.
- Admins can read student profiles, attempts, answers, and progress.
- Students cannot directly edit calculated progress.
- Admin routes must be protected by database policies as well as frontend route guards.

## Phase 5 — Student Dashboard

Build the dashboard using the reference image’s card-based hierarchy.

Dashboard content:

- Greeting
- Continue reviewing card
- Quick practice card
- Overall accuracy
- Questions answered
- Subject progress cards
- Recent quiz results
- Recommended next subject

Do not include:

- Leaderboards
- Social activity
- Excessive charts
- Project-management language
- Decorative metrics with no learning value

## Phase 6 — Review and Lessons

Build:

- Subject selection
- Subject overview
- Short lesson cards
- Lesson detail screen
- Completion indicator
- Start-practice action

Each lesson contains:

- Concept summary
- Important rule or formula
- One worked example
- Practice action

Lessons should be short enough to read on a phone.

## Phase 7 — Quiz Experience

Quiz flow:

1. Student selects a subject.
2. The system loads 10 questions.
3. One question is shown per screen.
4. Student chooses an answer.
5. Student may move backward and forward.
6. Student submits the quiz.
7. The score is calculated.
8. The attempt and answers are saved.
9. Results and explanations are displayed.

Quiz rules:

- 10 questions by default
- Four answer choices
- One correct answer
- No negative scoring
- Unanswered questions are allowed but clearly identified
- Submission confirmation appears when unanswered questions remain
- Duplicate submissions are prevented
- Abandoned quizzes do not affect progress
- Temporary network errors do not erase selected answers

## Phase 8 — Results and Mistakes

Results page:

- Score
- Accuracy
- Correct count
- Incorrect count
- Question review
- Selected answer
- Correct answer
- Explanation
- Retry button

Mistakes page:

- Previously incorrect questions
- Subject filter
- Explanation
- Practice-again action

The MVP will not include flashcards or spaced repetition.

## Phase 9 — Student Progress

Show:

- Overall accuracy
- Questions answered
- Progress by subject
- Recent attempts
- Strongest subject
- Subject needing improvement

Use simple progress bars and cards. Add charts only when they make progress easier to understand.

Progress updates after each completed quiz.

## Phase 10 — Admin Progress Dashboard

Create a protected `/admin` route.

Admin can:

- View all students
- Search by name or email
- View overall accuracy
- View total questions answered
- View progress by subject
- View recent activity
- Open a student detail page

Admin cannot:

- Edit student scores
- Edit answers
- Message students
- Edit questions
- Manage payments
- View unrelated private data

Student account creation remains outside the app through Supabase administration tools for the MVP.

## Phase 11 — Testing

Unit tests:

- Score calculation
- Accuracy calculation
- Progress aggregation
- Subject filtering
- Quiz completion
- Unanswered question validation

Component tests:

- Login form
- Subject cards
- Quiz answer selection
- Results display
- Progress cards
- Admin student table

End-to-end tests:

- Student can log in
- Student can open a subject
- Student can complete a quiz
- Student can view explanations
- Student progress updates
- Student cannot open `/admin`
- Admin can view the admin dashboard
- Admin can view a student’s progress
- Logged-out users are redirected
- Production build succeeds

Commands:

```powershell
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Phase 12 — Free Deployment

Use:

- Supabase free tier
- Vercel free tier
- GitHub free repository

Deployment sequence:

1. Create the Supabase project.
2. Apply database migrations.
3. Apply Row Level Security policies.
4. Add subjects and lessons.
5. Create an admin account.
6. Create at least one student account.
7. Push the project to GitHub.
8. Import the repository into Vercel.
9. Add Vercel environment variables.
10. Configure Supabase redirect URLs.
11. Deploy.
12. Test both student and admin access in production.

Production environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Production acceptance:

- Site loads on desktop and mobile.
- Student login works.
- Quiz completion works.
- Results persist after refresh.
- Progress updates correctly.
- Admin can view progress.
- Students cannot view admin data.
- No privileged keys are exposed.
- No gradients appear in the interface.
- Production build passes.

## Phase 13 — Generate Test Questions and Answers

This phase occurs after deployment and after all functionality has been verified.

Generate seed content:

- 10 Mathematics questions
- 10 English questions
- 10 Science questions
- 10 Reading Comprehension questions
- 10 General Knowledge questions

Each question must contain:

```text
subject
question
four choices
correct answer
explanation
difficulty
```

Example:

```json
{
  "subject": "Mathematics",
  "question": "What is 12 × 8?",
  "choices": [
    "86",
    "96",
    "108",
    "112"
  ],
  "correctAnswer": "96",
  "explanation": "12 multiplied by 8 equals 96.",
  "difficulty": "easy"
}
```

Content validation:

- Exactly one correct choice
- Four unique choices
- No ambiguous wording
- Explanation matches the answer
- Appropriate senior high school level
- Multiple skills represented per subject
- Questions support correct, incorrect, unanswered, and completed quiz tests

After insertion, verify:

- Every subject has questions.
- Every question has four choices.
- Every question has exactly one correct choice.
- Quiz scores match answer keys.
- Explanations display correctly.
- Student progress updates correctly.

## Phase 14 — Worker and Sub-Agent Development Loop

Use the following bounded orchestration prompt during implementation:

```text
You are the lead implementation agent for the College Reviewer website.

Goal:
Build and deploy the focused college reviewer according to IMPLEMENTATION_PLAN.md.

Before starting:
1. Inspect the repository and current git status.
2. Read the implementation plan.
3. Confirm the project structure and available tooling.
4. Do not overwrite unrelated user changes.

Create a small set of specialized workers only when useful:

1. UI Worker
   - Builds the layout, responsive shell, shadcn components, visual tokens, and student pages.
   - Must follow the no-gradient rule.
   - Must use the green, white, and soft-gray visual system.

2. Data/Auth Worker
   - Builds Supabase types, authentication flow, database access functions, migrations, and Row Level Security policies.
   - Must never expose service-role credentials.

3. Quiz Worker
   - Builds quiz state, answer selection, scoring, result persistence, explanations, mistakes, and progress updates.

4. Admin Worker
   - Builds the protected admin dashboard and read-only student progress views.

5. QA Worker
   - Adds unit, component, and end-to-end tests.
   - Checks responsive behavior, auth boundaries, loading states, error states, and no-gradient compliance.

6. Deployment Worker
   - Verifies environment configuration, production build, Vercel deployment readiness, Supabase redirect URLs, and production acceptance checks.

Worker rules:
- Do not create more than six workers at one time.
- Keep each worker’s file ownership separate to avoid conflicting edits.
- Each worker must report changed files, tests run, failures, and remaining risks.
- Workers must not silently change product scope.
- Workers must not add features outside the plan.
- The lead agent must review and integrate every worker result.
- Run tests after each integration.
- If a worker is blocked, the lead agent must resolve or reassign the task instead of creating unlimited workers.
- Continue the loop until all phase acceptance criteria pass.

Integration loop:
1. Assign one bounded task.
2. Wait for the worker result.
3. Inspect the diff.
4. Run relevant tests.
5. Fix integration issues.
6. Mark the phase complete.
7. Start the next phase only after the current phase passes.
8. Finish with deployment verification and question-bank generation.

Final report:
- List completed phases.
- List tests and deployment checks.
- List known limitations.
- Confirm that no gradients were used.
- Confirm that admin access is read-only for progress.
```

The orchestration prompt is a planning artifact only. It should not be executed until implementation is authorized.

## Important TypeScript Interfaces

Define shared types for:

```text
UserRole
Profile
Subject
Lesson
Question
QuestionChoice
QuizAttempt
QuizAnswer
StudentProgress
QuizResult
```

Keep Supabase queries inside reusable data-access functions:

```text
getCurrentProfile()
getSubjects()
getLessonsBySubject()
getQuestionsForQuiz()
createQuizAttempt()
saveQuizAnswers()
getQuizResult()
getStudentProgress()
getAdminStudents()
getAdminStudentProgress()
```

## Explicit Assumptions

- The workspace is currently empty.
- The first release is a small school or pilot application.
- Hosting must use free tiers.
- Students receive accounts from the administrator.
- Public registration is excluded.
- The admin dashboard is read-only.
- Questions are initially added through seed data.
- The MVP supports five subjects.
- Quizzes use multiple-choice questions.
- The interface must not use gradients.
- The attached image is inspiration only, not a functional specification.
- The implementation will be direct React development rather than Figma-first design.
- Content generation happens after deployment and functionality verification.

## Definition of Done

The project is complete when:

- The React application is deployed to a free Vercel URL.
- Supabase authentication and database are connected.
- A student can log in.
- A student can review a lesson.
- A student can complete a quiz.
- A student can see answers and explanations.
- A student can review mistakes.
- Student progress persists.
- An admin can view student progress.
- Students cannot access admin data.
- Tests and production build pass.
- Seed questions and answers are generated and verified.
- The UI follows the reference-inspired design system without gradients.
