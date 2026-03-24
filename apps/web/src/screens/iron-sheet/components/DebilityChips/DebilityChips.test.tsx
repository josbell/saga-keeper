import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DebilityChips } from './DebilityChips'
import type { DebilityKey } from './DebilityChips'

const allFalse: Record<DebilityKey, boolean> = {
  wounded: false,
  shaken: false,
  unprepared: false,
  encumbered: false,
  maimed: false,
  corrupted: false,
  cursed: false,
  tormented: false,
  weak: false,
}

describe('DebilityChips — rendering', () => {
  it('renders 9 chip buttons', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(9)
  })

  it('renders display labels for each debility', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    expect(screen.getByText('Wounded')).toBeTruthy()
    expect(screen.getByText('Shaken')).toBeTruthy()
    expect(screen.getByText('Unprepared')).toBeTruthy()
    expect(screen.getByText('Encumbered')).toBeTruthy()
    expect(screen.getByText('Maimed')).toBeTruthy()
    expect(screen.getByText('Corrupted')).toBeTruthy()
    expect(screen.getByText('Cursed')).toBeTruthy()
    expect(screen.getByText('Tormented')).toBeTruthy()
    expect(screen.getByText('Weak')).toBeTruthy()
  })

  it('inactive chip has aria-pressed="false"', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    expect(screen.getByText('Wounded').closest('button')!.getAttribute('aria-pressed')).toBe(
      'false'
    )
  })

  it('active chip has aria-pressed="true"', () => {
    render(<DebilityChips debilities={{ ...allFalse, wounded: true }} onToggle={vi.fn()} />)
    expect(screen.getByText('Wounded').closest('button')!.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders with all debilities active (all aria-pressed=true)', () => {
    const allTrue = Object.fromEntries(Object.keys(allFalse).map((k) => [k, true])) as Record<
      DebilityKey,
      boolean
    >
    render(<DebilityChips debilities={allTrue} onToggle={vi.fn()} />)
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn.getAttribute('aria-pressed')).toBe('true')
    })
  })

  it('section has aria-label="Debilities"', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    expect(screen.getByRole('region', { name: /debilities/i })).toBeTruthy()
  })
})

describe('DebilityChips — interaction', () => {
  it('clicking Wounded calls onToggle("wounded")', () => {
    const onToggle = vi.fn()
    render(<DebilityChips debilities={allFalse} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Wounded').closest('button')!)
    expect(onToggle).toHaveBeenCalledWith('wounded')
  })

  it('clicking Maimed calls onToggle("maimed")', () => {
    const onToggle = vi.fn()
    render(<DebilityChips debilities={allFalse} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Maimed').closest('button')!)
    expect(onToggle).toHaveBeenCalledWith('maimed')
  })

  it('clicking an active chip still calls onToggle', () => {
    const onToggle = vi.fn()
    render(<DebilityChips debilities={{ ...allFalse, shaken: true }} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Shaken').closest('button')!)
    expect(onToggle).toHaveBeenCalledWith('shaken')
  })
})

describe('DebilityChips — accessibility', () => {
  it('chip group has role="group" and aria-label="Debilities"', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    expect(screen.getByRole('group', { name: /debilities/i })).toBeTruthy()
  })

  it('all chips have type="button"', () => {
    render(<DebilityChips debilities={allFalse} onToggle={vi.fn()} />)
    screen.getAllByRole('button').forEach((btn) => {
      expect((btn as HTMLButtonElement).type).toBe('button')
    })
  })
})
