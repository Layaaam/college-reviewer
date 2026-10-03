import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Quiz } from './Quiz'

vi.mock('@/lib/auth', () => ({ useAuth: () => ({ profile: { id: 'student-1' } }) }))
vi.mock('@/lib/api', () => ({
  getSubjectBySlug: async () => ({ id: 'subject-1', slug: 'mathematics', name: 'Mathematics' }),
  getQuestionsForQuiz: async () => [{
    id: 'question-1', subject_id: 'subject-1', question_text: 'What is 2 + 2?', difficulty: 'easy',
    choices: [{ id: 'choice-1', question_id: 'question-1', choice_text: '4', sort_order: 1 }],
  }],
  submitQuiz: vi.fn(),
}))

describe('quiz timer', () => {
  beforeEach(() => localStorage.clear())

  it('resumes from a saved start time after the quiz page loads', async () => {
    localStorage.setItem('quiz-started:student-1:mathematics', String(Date.now() - 30_000))
    render(<MemoryRouter initialEntries={['/quiz/mathematics']}><Routes><Route path="/quiz/:quizId" element={<Quiz />} /></Routes></MemoryRouter>)
    const timer = await screen.findByRole('timer')
    expect(timer).toHaveTextContent(/09:2[89]|09:30/)
    expect(localStorage.getItem('quiz-started:student-1:mathematics')).not.toBeNull()
  })
})
