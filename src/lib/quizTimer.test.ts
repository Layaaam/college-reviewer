import { describe, expect, it } from 'vitest'
import { durationForMode, formatQuizTime, remainingQuizSeconds } from './quizTimer'

describe('quiz timer', () => {
  it('uses the server deadline instead of a client-created timer', () => {
    expect(remainingQuizSeconds(601_000, 1_000)).toBe(600)
    expect(remainingQuizSeconds(601_000, 31_000)).toBe(570)
  })

  it('does not go below zero after the time is up', () => {
    expect(remainingQuizSeconds(1_000, 1_000 + 20 * 60_000)).toBe(0)
  })

  it('times exams and leaves practice modes untimed', () => {
    expect(durationForMode('topic_practice')).toBeNull()
    expect(durationForMode('subject_quiz')).toBeNull()
    expect(durationForMode('subject_exam')).toBe(3600)
    expect(durationForMode('general_exam')).toBe(7200)
  })

  it('formats remaining time for display', () => {
    expect(formatQuizTime(600)).toBe('10:00')
    expect(formatQuizTime(9)).toBe('00:09')
    expect(formatQuizTime(0)).toBe('00:00')
  })
})
