import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceRoller } from './DiceRoller'

describe('DiceRoller — rendering', () => {
  it('renders a Roll button', () => {
    render(<DiceRoller />)
    expect(screen.getByRole('button', { name: /roll/i })).toBeDefined()
  })

  it('shows statName when provided', () => {
    render(<DiceRoller statName="Iron" />)
    expect(screen.getByText(/iron/i)).toBeDefined()
  })

  it('does not show stat name section when statName is omitted', () => {
    render(<DiceRoller />)
    expect(screen.queryByText(/edge|heart|iron|shadow|wits/i)).toBeNull()
  })

  it('shows no outcome before the first roll', () => {
    render(<DiceRoller />)
    expect(screen.queryByText(/strong-hit|weak-hit|miss/i)).toBeNull()
  })
})

describe('DiceRoller — rolling', () => {
  it('calls onRoll with a DiceResult after clicking Roll', async () => {
    const onRoll = vi.fn()
    render(<DiceRoller statValue={2} onRoll={onRoll} />)
    await userEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(onRoll).toHaveBeenCalledTimes(1)
    const result = onRoll.mock.calls[0]![0]
    expect(result).toHaveProperty('actionDie')
    expect(result).toHaveProperty('actionScore')
    expect(result).toHaveProperty('challengeDie1')
    expect(result).toHaveProperty('challengeDie2')
    expect(['strong-hit', 'weak-hit', 'miss']).toContain(result.outcome)
  })

  it('displays the outcome label after rolling', async () => {
    render(<DiceRoller />)
    await userEvent.click(screen.getByRole('button', { name: /roll/i }))
    const label = screen.getByTestId('outcome-label')
    expect(['Strong Hit', 'Weak Hit', 'Miss']).toContain(label.textContent)
  })

  it('displays die values after rolling', async () => {
    render(<DiceRoller statValue={3} />)
    await userEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByTestId('action-die')).toBeDefined()
    expect(screen.getByTestId('challenge-die-1')).toBeDefined()
    expect(screen.getByTestId('challenge-die-2')).toBeDefined()
  })

  it('updates the result on each subsequent roll', async () => {
    const onRoll = vi.fn()
    render(<DiceRoller statValue={2} onRoll={onRoll} />)
    const rollBtn = screen.getByRole('button', { name: /roll/i })

    await userEvent.click(rollBtn)
    expect(onRoll).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('outcome-label')).toBeDefined()

    await userEvent.click(rollBtn)
    expect(onRoll).toHaveBeenCalledTimes(2)
    // outcome-label still present and valid after second roll
    const label = screen.getByTestId('outcome-label')
    expect(['Strong Hit', 'Weak Hit', 'Miss']).toContain(label.textContent)
  })
})
