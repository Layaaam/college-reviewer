import { describe, expect, it } from 'vitest'
import { formatQuizTime, QUIZ_DURATION_SECONDS, remainingQuizSeconds } from './quizTimer'

describe('quiz timer', () => {
  it('starts at ten minutes and counts down from the saved start time', () => {
    expect(remainingQuizSeconds(1_000, 1_000)).toBe(QUIZ_DURATION_SECONDS)
    expect(remainingQuizSeconds(1_000, 31_000)).toBe(570)
  })

  it('does not go below zero after the time is up', () => {
    expect(remainingQuizSeconds(1_000, 1_000 + 20 * 60_000)).toBe(0)
  })

  it('formats remaining time for display', () => {
    expect(formatQuizTime(600)).toBe('10:00')
    expect(formatQuizTime(9)).toBe('00:09')
    expect(formatQuizTime(0)).toBe('00:00')
  })
})
