import { supabase } from '@/lib/supabase'
import type { Lesson, PracticeFeedback, Profile, QuizAnswer, QuizAttempt, QuizMode, QuizResult, QuizSession, StudentProgress, StudentTopicProgress, Subject, Topic } from '@/types'

const icons: Record<string, string> = {
  mathematics: '∑', 'english-language': 'Aa', science: '⚗', 'filipino-language': 'W',
  'reading-comprehension': '▤', 'mental-logical-reasoning': '◇',
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

type LessonRow = { id: string; subject_id: string; topic_id?: string; title: string; content: string; rule?: string; example?: string; sort_order: number; overview?: string; objectives?: string[]; concept_sections?: Lesson['concept_sections']; method_steps?: string[]; worked_examples?: Lesson['worked_examples']; common_mistakes?: string[]; exam_tips?: string[]; quick_checks?: Lesson['quick_checks']; source_links?: Lesson['source_links']; estimated_minutes?: number }

function parseLesson(row: LessonRow): Lesson {
  const [, summary = row.content, rule = '', example = ''] = row.content.match(
    /Concept summary:\s*(.*?)\s*Important rule:\s*(.*?)\s*Worked example:\s*(.*)/s,
  ) ?? []
  return { ...row, content: summary, rule: row.rule || rule, example: row.example || example, overview: row.overview || summary, objectives: row.objectives ?? [], concept_sections: row.concept_sections ?? [], method_steps: row.method_steps ?? [], worked_examples: row.worked_examples ?? [], common_mistakes: row.common_mistakes ?? [], exam_tips: row.exam_tips ?? [], quick_checks: row.quick_checks ?? [], source_links: row.source_links ?? [], estimated_minutes: row.estimated_minutes ?? 15 }
}

export async function getCurrentProfile(): Promise<Profile> {
  const { data: userData, error: userError } = await client().auth.getUser()
  if (userError || !userData.user) throw new Error('Please sign in again.')
  const row = check(await client().from('profiles').select('id,email,full_name,role').eq('id', userData.user.id).single())
  return row as Profile
}

export async function getSubjects(): Promise<Subject[]> {
  const rows = check(await client().from('subjects').select('id,name,slug,description,sort_order').eq('is_active', true).order('sort_order'))
  return rows.map((row) => decorateSubject(row))
}

export async function getSubjectBySlug(slug: string): Promise<Subject> {
  const row = check(await client().from('subjects').select('id,name,slug,description,sort_order').eq('slug', slug).eq('is_active', true).single())
  return decorateSubject(row)
}

export async function getLessonsBySubject(subjectId: string): Promise<Lesson[]> {
  const rows = check(await client().from('lessons').select('id,subject_id,topic_id,title,content,rule,example,sort_order,overview,objectives,concept_sections,method_steps,worked_examples,common_mistakes,exam_tips,quick_checks,source_links,estimated_minutes').eq('subject_id', subjectId).eq('status', 'published').not('topic_id', 'is', null).order('sort_order'))
  return rows.map(parseLesson)
}

export async function getLessonByTopic(topicId: string): Promise<Lesson> {
  const row = check(await client().from('lessons').select('id,subject_id,topic_id,title,content,rule,example,sort_order,overview,objectives,concept_sections,method_steps,worked_examples,common_mistakes,exam_tips,quick_checks,source_links,estimated_minutes').eq('topic_id', topicId).eq('status', 'published').single())
  return parseLesson(row)
}

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  return check(await client().from('topics').select('id,subject_id,slug,title,description,sort_order').eq('subject_id', subjectId).order('sort_order')) as Topic[]
}

export async function getTopics(): Promise<Topic[]> {
  return check(await client().from('topics').select('id,subject_id,slug,title,description,sort_order').order('subject_id').order('sort_order')) as Topic[]
}

export async function startQuizSession(mode: QuizMode, subjectId?: string, topicId?: string): Promise<string> {
  return check(await client().rpc('start_quiz_session', { p_mode: mode, p_subject_id: subjectId ?? null, p_topic_id: topicId ?? null })) as string
}

export async function getQuizSession(sessionId: string): Promise<QuizSession> {
  return check(await client().rpc('get_quiz_session', { p_session_id: sessionId })) as QuizSession
}

export async function saveQuizDraft(sessionId: string, questionId: string, choiceId: string, lock = false): Promise<PracticeFeedback | { saved: true }> {
  return check(await client().rpc('save_quiz_draft', { p_session_id: sessionId, p_question_id: questionId, p_choice_id: choiceId, p_lock: lock })) as PracticeFeedback | { saved: true }
}

export async function submitQuizSession(sessionId: string): Promise<string> {
  return check(await client().rpc('submit_quiz_session', { p_session_id: sessionId })) as string
}

export async function getQuizResult(attemptId: string): Promise<QuizResult> {
  const payload = check(await client().rpc('get_quiz_result', { p_attempt_id: attemptId })) as { attempt: QuizAttempt; questions: QuizResult['questions'] }
  const answers = payload.questions.map((question) => ({ id: `${attemptId}:${question.id}`, attempt_id: attemptId, question_id: question.id, selected_choice_id: question.selected_choice_id ?? undefined, is_correct: Boolean(question.is_correct) }))
  return { attempt: payload.attempt, answers, questions: payload.questions }
}

export async function getStudentProgress(): Promise<StudentProgress[]> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return check(await client().from('student_progress').select('*').eq('student_id', data.user.id)) as StudentProgress[]
}

export async function getStudentTopicProgress(): Promise<StudentTopicProgress[]> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return check(await client().from('student_topic_progress').select('*').eq('student_id', data.user.id)) as StudentTopicProgress[]
}

export async function getRecentAttempts(): Promise<QuizAttempt[]> {
  const { data, error } = await client().auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return check(await client().from('quiz_attempts').select('id,student_id,subject_id,score,total_questions,started_at,completed_at').eq('student_id', data.user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(10)) as QuizAttempt[]
}

export async function getMistakes(subjectId?: string): Promise<Array<{ question: QuizResult['questions'][number]; answer: QuizAnswer }>> {
  return check(await client().rpc('get_mistakes', { p_subject_id: subjectId ?? null })) as Array<{ question: QuizResult['questions'][number]; answer: QuizAnswer }>
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
