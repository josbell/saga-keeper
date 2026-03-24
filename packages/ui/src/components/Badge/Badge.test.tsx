import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge — rendering', () => {
  it('renders the label text', () => {
    render(<Badge variant="active" label="Active" />)
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('sets data-variant to the given variant', () => {
    const { container } = render(<Badge variant="co-op" label="Co-op" />)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('co-op')
  })

  it('supports saga-complete variant', () => {
    const { container } = render(<Badge variant="saga-complete" label="Complete" />)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('saga-complete')
  })

  it('supports abandoned variant', () => {
    const { container } = render(<Badge variant="abandoned" label="Abandoned" />)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('abandoned')
  })

  it('supports debility variant', () => {
    const { container } = render(<Badge variant="debility" label="Wounded" />)
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('debility')
  })
})
