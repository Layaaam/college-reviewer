import type { QuizMode } from '@/types'

export const durationForMode = (mode: QuizMode): number | null => mode === 'subject_exam' ? 60 * 60 : mode === 'general_exam' ? 120 * 60 : null

export function remainingQuizSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export function formatQuizTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}
