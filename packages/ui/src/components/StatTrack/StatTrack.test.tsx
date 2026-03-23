import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatTrack } from './StatTrack'

describe('StatTrack — rendering', () => {
  it('renders max number of pip buttons', () => {
    render(<StatTrack value={2} max={5} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('marks pips up to value as filled via aria-pressed', () => {
    render(<StatTrack value={3} max={5} />)
    const buttons = screen.getAllByRole('button')
    expect((buttons[0] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('true')
    expect((buttons[1] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('true')
    expect((buttons[2] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('true')
    expect((buttons[3] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('false')
    expect((buttons[4] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('false')
  })

  it('renders all pips unfilled when value is 0', () => {
    render(<StatTrack value={0} max={4} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn.getAttribute('aria-pressed')).toBe('false')
    })
  })

  it('renders all pips filled when value equals max', () => {
    render(<StatTrack value={4} max={4} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn.getAttribute('aria-pressed')).toBe('true')
    })
  })
})

describe('StatTrack — interaction', () => {
  it('calls onChange with the pip index + 1 when a pip is clicked', async () => {
    const onChange = vi.fn()
    render(<StatTrack value={1} max={5} onChange={onChange} />)
    await userEvent.click(screen.getAllByRole('button')[3]!)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onChange(1) when the first pip is clicked', async () => {
    const onChange = vi.fn()
    render(<StatTrack value={0} max={5} onChange={onChange} />)
    await userEvent.click(screen.getAllByRole('button')[0]!)
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('does not call onChange when readOnly is true', async () => {
    const onChange = vi.fn()
    render(<StatTrack value={2} max={5} onChange={onChange} readOnly />)
    await userEvent.click(screen.getAllByRole('button')[3]!)
    expect(onChange).not.toHaveBeenCalled()
  })
})
