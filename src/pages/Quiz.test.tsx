import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Quiz } from './Quiz'

vi.mock('@/lib/api', () => ({
  getQuizSession: async () => ({ id: 'session-1', mode: 'subject_exam', status: 'active', started_at: new Date().toISOString(), deadline: new Date(Date.now() + 30 * 60_000).toISOString(), questions: [{ id: 'question-1', subject_id: 'subject-1', question_text: 'What is 2 + 2?', difficulty: 'easy', choices: [{ id: 'choice-1', question_id: 'question-1', choice_text: '4', sort_order: 1 }] }] }),
  saveQuizDraft: vi.fn(), submitQuizSession: vi.fn(),
}))

describe('quiz timer', () => {
  it('renders the remaining time from the server-issued deadline', async () => {
    render(<MemoryRouter initialEntries={['/quiz/session/session-1']}><Routes><Route path="/quiz/session/:sessionId" element={<Quiz />} /></Routes></MemoryRouter>)
    const timer = await screen.findByRole('timer')
    expect(timer).toHaveTextContent(/29:5[89]|30:00/)
  })
})
