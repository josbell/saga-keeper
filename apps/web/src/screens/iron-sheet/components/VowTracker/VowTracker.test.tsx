import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VowTracker } from './VowTracker'
import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'

function makeVow(overrides: Partial<IronswornVow> = {}): IronswornVow {
  return {
    id: 'vow-1',
    title: 'Avenge my kin',
    rank: 'dangerous',
    progress: 0,
    fulfilled: false,
    ...overrides,
  }
}

describe('VowTracker — rendering', () => {
  it('renders nothing and does not crash when vows is empty', () => {
    const { container } = render(<VowTracker vows={[]} onProgressChange={vi.fn()} />)
    expect(container.querySelector('article')).toBeNull()
  })

  it('renders one article per vow', () => {
    const vows = [makeVow({ id: 'v1' }), makeVow({ id: 'v2', title: 'Seek the oracle' })]
    render(<VowTracker vows={vows} onProgressChange={vi.fn()} />)
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('renders the vow title in an h3', () => {
    render(<VowTracker vows={[makeVow()]} onProgressChange={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 3, name: /avenge my kin/i })).toBeTruthy()
  })

  it('renders a rank label (capitalised)', () => {
    render(<VowTracker vows={[makeVow({ rank: 'dangerous' })]} onProgressChange={vi.fn()} />)
    expect(screen.getByText('Dangerous')).toBeTruthy()
  })

  it('renders 10 progress boxes per vow', () => {
    render(<VowTracker vows={[makeVow()]} onProgressChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(10)
  })

  it('progress boxes up to vow.progress are aria-pressed=true', () => {
    render(<VowTracker vows={[makeVow({ progress: 4 })]} onProgressChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(buttons[3]!.getAttribute('aria-pressed')).toBe('true')
    expect(buttons[4]!.getAttribute('aria-pressed')).toBe('false')
  })

  it('renders a fulfilled indicator when vow.fulfilled is true', () => {
    render(<VowTracker vows={[makeVow({ fulfilled: true })]} onProgressChange={vi.fn()} />)
    expect(screen.getByRole('img', { name: /fulfilled/i })).toBeTruthy()
  })

  it('does not render fulfilled indicator when vow.fulfilled is false', () => {
    render(<VowTracker vows={[makeVow({ fulfilled: false })]} onProgressChange={vi.fn()} />)
    expect(screen.queryByRole('img', { name: /fulfilled/i })).toBeNull()
  })

  it('section has aria-label="Vows"', () => {
    render(<VowTracker vows={[makeVow()]} onProgressChange={vi.fn()} />)
    expect(screen.getByRole('region', { name: /vows/i })).toBeTruthy()
  })

  it('final progress box (index 9) has data-complete=true when progress=10', () => {
    render(<VowTracker vows={[makeVow({ progress: 10 })]} onProgressChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[9]!.getAttribute('data-complete')).toBe('true')
  })
})

describe('VowTracker — interaction', () => {
  it('clicking progress box N calls onProgressChange(vowId, N)', () => {
    const onProgressChange = vi.fn()
    render(
      <VowTracker
        vows={[makeVow({ id: 'vow-1', progress: 0 })]}
        onProgressChange={onProgressChange}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2]!) // index 2 → progress value 3
    expect(onProgressChange).toHaveBeenCalledWith('vow-1', 3)
  })

  it('clicking the already-filled final box (progress=10) calls onProgressChange with 0', () => {
    const onProgressChange = vi.fn()
    render(
      <VowTracker
        vows={[makeVow({ id: 'vow-1', progress: 10 })]}
        onProgressChange={onProgressChange}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[9]!) // final box, currently filled
    expect(onProgressChange).toHaveBeenCalledWith('vow-1', 0)
  })
})

describe('VowTracker — accessibility', () => {
  it('progress buttons have aria-label "Progress N"', () => {
    render(<VowTracker vows={[makeVow()]} onProgressChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Progress 1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Progress 10' })).toBeTruthy()
  })

  it('each vow is wrapped in an <article> element', () => {
    const { container } = render(<VowTracker vows={[makeVow()]} onProgressChange={vi.fn()} />)
    expect(container.querySelector('article')).toBeTruthy()
  })
})
