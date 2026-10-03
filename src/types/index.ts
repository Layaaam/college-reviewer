export type UserRole = 'student' | 'admin'
export interface Profile { id: string; email: string; full_name: string; role: UserRole }
export interface Subject { id: string; name: string; slug: string; description: string; sort_order: number; icon: string; color: string }
export interface Topic { id: string; subject_id: string; slug: string; title: string; description: string; sort_order: number }
export interface LessonConcept { title: string; body: string }
export interface WorkedExample { title: string; passage?: string | null; prompt: string; answer: string; solution: string }
export interface QuickCheck { prompt: string; answer: string; explanation: string }
export interface SourceLink { title: string; url: string }
export interface Lesson { id: string; subject_id: string; topic_id?: string; title: string; content: string; rule: string; example: string; sort_order: number; overview: string; objectives: string[]; concept_sections: LessonConcept[]; method_steps: string[]; worked_examples: WorkedExample[]; common_mistakes: string[]; exam_tips: string[]; quick_checks: QuickCheck[]; source_links: SourceLink[]; estimated_minutes: number }
export interface QuestionChoice { id: string; question_id: string; choice_text: string; sort_order: number }
export interface ResultQuestionChoice extends QuestionChoice { is_correct: boolean }
export interface Question { id: string; subject_id: string; topic_id?: string; passage?: string | null; question_text: string; difficulty: 'easy' | 'medium' | 'hard'; choices: QuestionChoice[]; selected_choice_id?: string | null; locked_at?: string | null }
export interface ResultQuestion extends Omit<Question, 'choices'> { explanation: string; choices: ResultQuestionChoice[]; selected_choice_id?: string | null; is_correct?: boolean }
export type QuizMode = 'topic_practice' | 'subject_quiz' | 'subject_exam' | 'general_exam'
export interface QuizSession { id: string; mode: QuizMode; subject_id?: string | null; topic_id?: string | null; status: 'active' | 'completed' | 'expired'; started_at: string; deadline?: string | null; questions: Question[] }
export interface PracticeFeedback { is_correct: boolean; correct_choice_id: string; explanation: string }
export interface QuizAttempt { id: string; student_id: string; subject_id?: string | null; topic_id?: string | null; mode?: QuizMode; score: number; total_questions: number; started_at: string; completed_at?: string }
export interface QuizAnswer { id: string; attempt_id: string; question_id: string; selected_choice_id?: string; is_correct: boolean }
export interface StudentProgress { id: string; student_id: string; subject_id: string; questions_answered: number; correct_answers: number; accuracy: number; last_activity: string }
export interface StudentTopicProgress { student_id: string; topic_id: string; questions_answered: number; correct_answers: number; exposure_count: number; accuracy: number; last_activity: string }
export interface QuizResult { attempt: QuizAttempt; answers: QuizAnswer[]; questions: ResultQuestion[] }
