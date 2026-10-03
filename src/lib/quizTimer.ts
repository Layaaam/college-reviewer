export const QUIZ_DURATION_SECONDS = 10 * 60

export function remainingQuizSeconds(startedAt: number, now: number): number {
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  return Math.max(0, QUIZ_DURATION_SECONDS - elapsed)
}

export function formatQuizTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}
