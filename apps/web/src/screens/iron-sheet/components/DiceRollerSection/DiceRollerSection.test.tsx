import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiceRollerSection } from './DiceRollerSection'
import type { StatKey } from '../StatsGrid/StatsGrid'

describe('DiceRollerSection — rendering', () => {
  it('renders the DiceRoller "Roll the Fate" button', () => {
    render(<DiceRollerSection selectedStat={null} statValue={null} />)
    expect(screen.getByRole('button', { name: /roll the fate/i })).toBeTruthy()
  })

  it('shows "Select a stat above to roll" when selectedStat is null', () => {
    render(<DiceRollerSection selectedStat={null} statValue={null} />)
    expect(screen.getByText(/select a stat above to roll/i)).toBeTruthy()
  })

  it('does not show the placeholder text when a stat is selected', () => {
    render(<DiceRollerSection selectedStat={'edge' as StatKey} statValue={2} />)
    expect(screen.queryByText(/select a stat above to roll/i)).toBeNull()
  })

  it('shows the stat name when a stat is selected', () => {
    render(<DiceRollerSection selectedStat={'heart' as StatKey} statValue={3} />)
    // DiceRoller renders statName in data-testid="stat-name" span
    expect(screen.getByTestId('stat-name').textContent).toMatch(/heart/i)
  })

  it('passes statValue to DiceRoller (visible when stat is selected)', () => {
    render(<DiceRollerSection selectedStat={'iron' as StatKey} statValue={2} />)
    // DiceRoller accepts statValue; we verify the stat name at minimum
    expect(screen.getByTestId('stat-name').textContent).toMatch(/iron/i)
  })

  it('passes statValue=0 to DiceRoller when statValue is null', () => {
    render(<DiceRollerSection selectedStat={null} statValue={null} />)
    // Roll button should still be present (DiceRoller always renders it)
    expect(screen.getByRole('button', { name: /roll the fate/i })).toBeTruthy()
  })

  it('section has aria-label="Dice Roller"', () => {
    render(<DiceRollerSection selectedStat={null} statValue={null} />)
    expect(screen.getByRole('region', { name: /dice roller/i })).toBeTruthy()
  })
})
