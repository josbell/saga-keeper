import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card — rendering', () => {
  it('renders children', () => {
    render(<Card>Campaign name</Card>)
    expect(screen.getByText('Campaign name')).toBeDefined()
  })

  it('defaults to data-variant="default"', () => {
    const { container } = render(<Card>content</Card>)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('default')
  })

  it('sets data-variant="hero" when variant is hero', () => {
    const { container } = render(<Card variant="hero">content</Card>)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('hero')
  })

  it('forwards className', () => {
    const { container } = render(<Card className="custom">content</Card>)
    expect(container.firstElementChild?.classList.contains('custom')).toBe(true)
  })
})
