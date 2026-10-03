import { describe, expect, it } from 'vitest'
import { calculateAccuracy, calculateScore, validateUnanswered } from './scoring'
describe('quiz scoring', () => { it('calculates score as a percentage', () => expect(calculateScore(8, 10)).toBe(80)); it('handles zero totals', () => expect(calculateScore(0, 0)).toBe(0)); it('calculates answered accuracy', () => expect(calculateAccuracy(3, 4)).toBe(75)); it('counts unanswered questions', () => expect(validateUnanswered(['a', undefined, '', 'd'])).toBe(2)) })
