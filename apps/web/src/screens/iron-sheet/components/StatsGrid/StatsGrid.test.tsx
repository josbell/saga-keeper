import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsGrid } from './StatsGrid'
import type { StatKey } from './StatsGrid'

const defaultProps = {
  edge: 2,
  heart: 3,
  iron: 1,
  shadow: 2,
  wits: 1,
  selectedStat: null as StatKey | null,
  onStatSelect: vi.fn(),
}

describe('StatsGrid — rendering', () => {
  it('renders 5 stat stone buttons', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('each stone shows its stat name', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByText(/edge/i)).toBeTruthy()
    expect(screen.getByText(/heart/i)).toBeTruthy()
    expect(screen.getByText(/iron/i)).toBeTruthy()
    expect(screen.getByText(/shadow/i)).toBeTruthy()
    expect(screen.getByText(/wits/i)).toBeTruthy()
  })

  it('each stone shows its numeric value', () => {
    render(<StatsGrid {...defaultProps} edge={2} heart={3} iron={1} shadow={2} wits={1} />)
    // We have 2 stats with value 2, 2 with value 1, 1 with value 3
    const buttons = screen.getAllByRole('button')
    const labels = buttons.map((b) => b.getAttribute('aria-label') ?? '')
    expect(labels.some((l) => l.includes('Edge') && l.includes('2'))).toBe(true)
    expect(labels.some((l) => l.includes('Heart') && l.includes('3'))).toBe(true)
    expect(labels.some((l) => l.includes('Iron') && l.includes('1'))).toBe(true)
  })

  it('has data-testid="stat-edge"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByTestId('stat-edge')).toBeTruthy()
  })

  it('has data-testid="stat-heart"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByTestId('stat-heart')).toBeTruthy()
  })

  it('has data-testid="stat-iron"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByTestId('stat-iron')).toBeTruthy()
  })

  it('has data-testid="stat-shadow"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByTestId('stat-shadow')).toBeTruthy()
  })

  it('has data-testid="stat-wits"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByTestId('stat-wits')).toBeTruthy()
  })

  it('renders rune glyphs inside aria-hidden spans', () => {
    const { container } = render(<StatsGrid {...defaultProps} />)
    const runeSpans = container.querySelectorAll('[aria-hidden="true"]')
    expect(runeSpans.length).toBe(5)
  })

  it('section has aria-label="Character Stats"', () => {
    render(<StatsGrid {...defaultProps} />)
    expect(screen.getByRole('region', { name: /character stats/i })).toBeTruthy()
  })
})

describe('StatsGrid — selection', () => {
  it('clicking edge calls onStatSelect("edge")', () => {
    const onStatSelect = vi.fn()
    render(<StatsGrid {...defaultProps} onStatSelect={onStatSelect} />)
    fireEvent.click(screen.getByTestId('stat-edge'))
    expect(onStatSelect).toHaveBeenCalledWith('edge')
  })

  it('clicking wits calls onStatSelect("wits")', () => {
    const onStatSelect = vi.fn()
    render(<StatsGrid {...defaultProps} onStatSelect={onStatSelect} />)
    fireEvent.click(screen.getByTestId('stat-wits'))
    expect(onStatSelect).toHaveBeenCalledWith('wits')
  })

  it('selected stat has aria-pressed="true"', () => {
    render(<StatsGrid {...defaultProps} selectedStat="heart" />)
    expect(screen.getByTestId('stat-heart').getAttribute('aria-pressed')).toBe('true')
  })

  it('unselected stats have aria-pressed="false"', () => {
    render(<StatsGrid {...defaultProps} selectedStat="heart" />)
    expect(screen.getByTestId('stat-edge').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('stat-iron').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('stat-shadow').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('stat-wits').getAttribute('aria-pressed')).toBe('false')
  })

  it('all stats have aria-pressed="false" when selectedStat is null', () => {
    render(<StatsGrid {...defaultProps} selectedStat={null} />)
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn.getAttribute('aria-pressed')).toBe('false')
    })
  })
})

describe('StatsGrid — accessibility', () => {
  it('all stones have type="button"', () => {
    render(<StatsGrid {...defaultProps} />)
    screen.getAllByRole('button').forEach((btn) => {
      expect((btn as HTMLButtonElement).type).toBe('button')
    })
  })

  it('each button has an accessible name containing the stat name and value', () => {
    render(<StatsGrid {...defaultProps} edge={2} />)
    const btn = screen.getByTestId('stat-edge')
    const label = btn.getAttribute('aria-label') ?? ''
    expect(label).toContain('Edge')
    expect(label).toContain('2')
  })
})
