export type UserRole = 'student' | 'admin'
export interface Profile { id: string; email: string; full_name: string; role: UserRole }
export interface Subject { id: string; name: string; slug: string; description: string; sort_order: number; icon: string; color: string }
export interface Lesson { id: string; subject_id: string; title: string; content: string; rule: string; example: string; sort_order: number }
export interface QuestionChoice { id: string; question_id: string; choice_text: string; is_correct: boolean; sort_order: number }
export interface Question { id: string; subject_id: string; lesson_id?: string; question_text: string; explanation: string; difficulty: 'easy' | 'medium' | 'hard'; choices: QuestionChoice[] }
export interface QuizAttempt { id: string; student_id: string; subject_id: string; score: number; total_questions: number; started_at: string; completed_at?: string }
export interface QuizAnswer { id: string; attempt_id: string; question_id: string; selected_choice_id?: string; is_correct: boolean }
export interface StudentProgress { id: string; student_id: string; subject_id: string; questions_answered: number; correct_answers: number; accuracy: number; last_activity: string }
export interface QuizResult { attempt: QuizAttempt; answers: QuizAnswer[]; questions: Question[] }
