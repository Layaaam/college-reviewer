import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge, ProgressBar } from './ui'
describe('foundation components', () => { it('renders a badge', () => { render(<Badge>Ready</Badge>); expect(screen.getByText('Ready')).toBeInTheDocument() }); it('sets progress width', () => { const { container } = render(<ProgressBar value={60} />); expect(container.querySelector('[style="width: 60%;"]')).toBeTruthy() }) })
