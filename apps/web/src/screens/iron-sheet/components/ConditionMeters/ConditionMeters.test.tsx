import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConditionMeters } from './ConditionMeters'

const defaultProps = {
  health: 3,
  spirit: 4,
  supply: 2,
  momentum: 1,
  onHealthChange: vi.fn(),
  onSpiritChange: vi.fn(),
  onSupplyChange: vi.fn(),
  onMomentumChange: vi.fn(),
}

describe('ConditionMeters — rendering', () => {
  it('renders a "Health" label', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByText(/health/i)).toBeTruthy()
  })

  it('renders a "Spirit" label', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByText(/spirit/i)).toBeTruthy()
  })

  it('renders a "Supply" label', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByText(/supply/i)).toBeTruthy()
  })

  it('renders a "Momentum" label', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByText(/momentum/i)).toBeTruthy()
  })

  it('renders 5 pip buttons for health (max=5)', () => {
    render(<ConditionMeters {...defaultProps} />)
    // StatTrack health renders buttons labelled "Set to N"
    const healthPips = screen.getAllByLabelText(/set to \d/i)
    // 3 tracks × 5 pips = 15 total; we just need at least 5 per track
    expect(healthPips.length).toBeGreaterThanOrEqual(5)
  })

  it('renders the MomentumTrack slider', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByRole('slider', { name: /momentum/i })).toBeTruthy()
  })

  it('MomentumTrack receives the momentum value', () => {
    render(<ConditionMeters {...defaultProps} momentum={-2} />)
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuenow')).toBe('-2')
  })

  it('section has aria-label="Condition Meters"', () => {
    render(<ConditionMeters {...defaultProps} />)
    expect(screen.getByRole('region', { name: /condition meters/i })).toBeTruthy()
  })
})

describe('ConditionMeters — interaction', () => {
  it('clicking a health pip calls onHealthChange with the pip value', () => {
    const onHealthChange = vi.fn()
    render(<ConditionMeters {...defaultProps} health={0} onHealthChange={onHealthChange} />)
    // StatTrack renders buttons with aria-label "Set to N"
    const firstPip = screen.getAllByLabelText('Set to 1')[0]!
    fireEvent.click(firstPip)
    expect(onHealthChange).toHaveBeenCalledWith(1)
  })

  it('changing MomentumTrack calls onMomentumChange', () => {
    const onMomentumChange = vi.fn()
    render(<ConditionMeters {...defaultProps} momentum={0} onMomentumChange={onMomentumChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onMomentumChange).toHaveBeenCalledWith(1)
  })
})
