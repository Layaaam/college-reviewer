import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Review } from './Review'
import { Dashboard } from './Dashboard'

vi.mock('@/lib/auth', () => ({ useAuth: () => ({ profile: { id: 'student-1', email: 'student@example.com', full_name: 'Test Student', role: 'student' } }) }))
vi.mock('@/lib/api', () => ({
  getSubjects: async () => [
    { id: 'math-1', name: 'Mathematics', slug: 'mathematics', description: 'Numbers', sort_order: 1, icon: '∑', color: '#E8F3ED' },
    { id: 'science-1', name: 'Science', slug: 'science', description: 'Nature', sort_order: 2, icon: '⚗', color: '#F0F4F1' },
  ],
  getStudentProgress: async () => [],
  getRecentAttempts: async () => [],
}))

describe('student pages', () => {
  it('shows subjects returned by the data layer', async () => {
    render(<MemoryRouter><Review /></MemoryRouter>)
    expect(await screen.findByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
  })
  it('shows an empty learning dashboard without fabricated metrics', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(await screen.findByText('Your subjects')).toBeInTheDocument()
    expect(screen.getByText('No completed quizzes yet. Your results will appear here.')).toBeInTheDocument()
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })
})
