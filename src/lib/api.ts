import { supabase } from '@/lib/supabase'
import type { Lesson, Profile, Question, QuestionChoice, QuizAnswer, QuizAttempt, QuizResult, StudentProgress, Subject } from '@/types'

const icons: Record<string, string> = {
  mathematics: '∑', english: 'Aa', science: '⚗',
  'reading-comprehension': '▤', 'general-knowledge': '✦',
}

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key.')
  return supabase
}

function check<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new Error('The requested data was not found.')
  return result.data as NonNullable<T>
}

function decorateSubject(row: Omit<Subject, 'icon' | 'color'>): Subject {
  return { ...row, icon: icons[row.slug] ?? '✦', color: row.sort_order % 2 ? '#E8F3ED' : '#F0F4F1' }
}

function parseLesson(row: { id: string; subject_id: string; title: string; content: string; sort_order: number }): Lesson {
  const [, summary = row.content, rule = '', example = ''] = row.content.match(
    /Concept summary:\s*(.*?)\s*Important rule:\s*(.*?)\s*Worked example:\s*(.*)/s,
  ) ?? []
  return { ...row, content: summary, rule, example }
}

export async function getCurrentProfile(): Promise<Profile> {
  const { data: userData, error: userError } = await client().auth.getUser()
  if (userError || !userData.user) throw new Error('Please sign in again.')
  const row = check(await client().from('profiles').select('id,email,full_name,role').eq('id', userData.user.id).single())
  return row as Profile
}

export async function getSubjects(): Promise<Subject[]> {
  const rows = check(await client().from('subjects').select('id,name,slug,description,sort_order').order('sort_order'))
  return rows.map((row) => decorateSubject(row))
}

export async function getSubjectBySlug(slug: string): Promise<Subject> {
  const row = check(await client().from('subjects').select('id,name,slug,description,sort_order').eq('slug', slug).single())
  return decorateSubject(row)
}

export async function getLessonsBySubject(subjectId: string): Promise<Lesson[]> {
  const rows = check(await client().from('lessons').select('id,subject_id,title,content,sort_order').eq('subject_id', subjectId).order('sort_order'))
  return rows.map(parseLesson)
}

async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids.length) return []
  const rows = check(await client().from('questions')
    .select('id,subject_id,lesson_id,question_text,explanation,difficulty,question_choices(id,question_id,choice_text,is_correct,sort_order)')
    .in('id', ids))
  const byId = new Map(rows.map((row) => [row.id, {
    ...row, choices: [...(row.question_choices as QuestionChoice[])].sort((a, b) => a.sort_order - b.sort_order),
  } as Question]))
  return ids.flatMap((id) => byId.has(id) ? [byId.get(id)!] : [])
}

export async function getQuestionsForQuiz(subjectId: string): Promise<Question[]> {
  const rows = check(await client().from('questions').select('id').eq('subject_id', subjectId).order('created_at').limit(10))
  return getQuestionsByIds(rows.map((row) => row.id))
}

export async function submitQuiz(subjectId: string, answers: Array<{ question_id: string; selected_choice_id: string | null }>): Promise<string> {
  const attemptId = check(await client().rpc('submit_quiz', { p_subject_id: subjectId, p_answers: answers }))
  return attemptId as string
}

export async function getQuizResult(attemptId: string): Promise<QuizResult> {
  const attempt = check(await client().from('quiz_attempts').select('id,student_id,subject_id,score,total_questions,started_at,completed_at').eq('id', attemptId).single()) as QuizAttempt
  const answers = check(await client().from('quiz_answers').select('id,attempt_id,question_id,selected_choice_id,is_correct').eq('attempt_id', attemptId)) as QuizAnswer[]
  const questions = await getQuestionsByIds(answers.map((answer) => answer.question_id))
  return { attempt, answers, questions }
}

export async function getStudentProgress(): Promise<StudentProgress[]> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return check(await client().from('student_progress').select('*').eq('student_id', data.user.id)) as StudentProgress[]
}

export async function getRecentAttempts(): Promise<QuizAttempt[]> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return check(await client().from('quiz_attempts').select('id,student_id,subject_id,score,total_questions,started_at,completed_at').eq('student_id', data.user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(10)) as QuizAttempt[]
}

export async function getMistakes(subjectId?: string): Promise<Array<{ question: Question; answer: QuizAnswer }>> {
  const { data: userData, error: userError } = await client().auth.getUser()
  if (userError || !userData.user) throw new Error('Please sign in again.')
  const attempts = check(await client().from('quiz_attempts').select('id,subject_id').eq('student_id', userData.user.id).not('completed_at', 'is', null))
  const relevant = subjectId ? attempts.filter((attempt) => attempt.subject_id === subjectId) : attempts
  if (!relevant.length) return []
  const answers = check(await client().from('quiz_answers').select('id,attempt_id,question_id,selected_choice_id,is_correct').in('attempt_id', relevant.map((attempt) => attempt.id)).eq('is_correct', false)) as QuizAnswer[]
  const latest = new Map<string, QuizAnswer>()
  for (const answer of answers) latest.set(answer.question_id, answer)
  const questions = await getQuestionsByIds([...latest.keys()])
  return questions.map((question) => ({ question, answer: latest.get(question.id)! }))
}

export interface AdminStudentSummary extends Profile { accuracy: number; questions_answered: number; last_activity: string | null }

export async function getAdminStudents(): Promise<AdminStudentSummary[]> {
  const profiles = check(await client().from('profiles').select('id,email,full_name,role').eq('role', 'student').order('full_name')) as Profile[]
  const progress = check(await client().from('student_progress').select('student_id,questions_answered,correct_answers,last_activity'))
  return profiles.map((profile) => {
    const rows = progress.filter((row) => row.student_id === profile.id)
    const questions_answered = rows.reduce((sum, row) => sum + row.questions_answered, 0)
    const correct = rows.reduce((sum, row) => sum + row.correct_answers, 0)
    const last_activity = rows.map((row) => row.last_activity).sort().at(-1) ?? null
    return { ...profile, questions_answered, accuracy: questions_answered ? Math.round(correct / questions_answered * 100) : 0, last_activity }
  })
}

export async function getAdminStudentProgress(studentId: string): Promise<StudentProgress[]> {
  return check(await client().from('student_progress').select('*').eq('student_id', studentId)) as StudentProgress[]
}

export async function getAdminStudentAttempts(studentId: string): Promise<QuizAttempt[]> {
  return check(await client().from('quiz_attempts').select('id,student_id,subject_id,score,total_questions,started_at,completed_at').eq('student_id', studentId).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(10)) as QuizAttempt[]
}
