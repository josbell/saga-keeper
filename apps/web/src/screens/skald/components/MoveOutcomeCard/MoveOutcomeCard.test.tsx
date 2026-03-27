import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoveOutcomeCard, type MoveOutcomeData } from './MoveOutcomeCard'
import type { DiceRollRecord } from '@saga-keeper/domain'

function makeProps(overrides: Partial<MoveOutcomeData> = {}): MoveOutcomeData {
  return {
    moveId: 'face-danger',
    moveName: 'Face Danger',
    result: 'strong-hit',
    match: false,
    roll: null,
    consequences: [],
    ...overrides,
  }
}

const sampleRoll: DiceRollRecord = {
  actionDie: 4,
  challengeDice: [3, 5],
  modifier: 2,
  total: 6,
  result: 'strong-hit',
  match: false,
}

describe('MoveOutcomeCard — structure', () => {
  it('renders move name', () => {
    render(<MoveOutcomeCard {...makeProps()} />)
    expect(screen.getByText('Face Danger')).toBeTruthy()
  })

  it('renders result label "Strong Hit" for strong-hit', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'strong-hit' })} />)
    expect(screen.getByText('Strong Hit')).toBeTruthy()
  })

  it('renders result label "Weak Hit" for weak-hit', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'weak-hit' })} />)
    expect(screen.getByText('Weak Hit')).toBeTruthy()
  })

  it('renders result label "Miss" for miss', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'miss' })} />)
    expect(screen.getByText('Miss')).toBeTruthy()
  })

  it('aria-label includes move name and result', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'weak-hit', moveName: 'Compel' })} />)
    const card = screen.getByTestId('move-outcome-card')
    expect(card.getAttribute('aria-label')).toBe('Compel — Weak Hit')
  })
})

describe('MoveOutcomeCard — badge classes', () => {
  it('strong-hit badge has correct class', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'strong-hit' })} />)
    // The badge text is "Strong Hit" and has badgeStrongHit class
    expect(screen.getByText('Strong Hit').className).toContain('badgeStrongHit')
  })

  it('weak-hit badge has correct class', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'weak-hit' })} />)
    expect(screen.getByText('Weak Hit').className).toContain('badgeWeakHit')
  })

  it('miss badge has correct class', () => {
    render(<MoveOutcomeCard {...makeProps({ result: 'miss' })} />)
    expect(screen.getByText('Miss').className).toContain('badgeMiss')
  })
})

describe('MoveOutcomeCard — match pill', () => {
  it('shows "Match" pill when match is true', () => {
    render(<MoveOutcomeCard {...makeProps({ match: true })} />)
    expect(screen.getByText('Match')).toBeTruthy()
  })

  it('does not show "Match" pill when match is false', () => {
    render(<MoveOutcomeCard {...makeProps({ match: false })} />)
    expect(screen.queryByText('Match')).toBeNull()
  })
})

describe('MoveOutcomeCard — dice row', () => {
  it('renders dice breakdown when roll is provided', () => {
    render(<MoveOutcomeCard {...makeProps({ roll: sampleRoll })} />)
    const diceRow = screen.getByLabelText('Dice roll')
    expect(diceRow).toBeTruthy()
    // action die value
    expect(diceRow.textContent).toContain('4')
    // challenge dice
    expect(diceRow.textContent).toContain('3')
    expect(diceRow.textContent).toContain('5')
  })

  it('does not render dice row when roll is null', () => {
    render(<MoveOutcomeCard {...makeProps({ roll: null })} />)
    expect(screen.queryByLabelText('Dice roll')).toBeNull()
  })
})

describe('MoveOutcomeCard — consequences', () => {
  it('renders each consequence delta', () => {
    render(
      <MoveOutcomeCard
        {...makeProps({
          consequences: [
            { stat: 'health', before: 5, after: 4 },
            { stat: 'spirit', before: 3, after: 4 },
          ],
        })}
      />,
    )
    const area = screen.getByLabelText('Consequences')
    expect(area.textContent).toContain('Health')
    expect(area.textContent).toContain('Spirit')
  })

  it('does not render consequences section when list is empty', () => {
    render(<MoveOutcomeCard {...makeProps({ consequences: [] })} />)
    expect(screen.queryByLabelText('Consequences')).toBeNull()
  })

  it('negative delta has deltaNegative class', () => {
    render(
      <MoveOutcomeCard
        {...makeProps({
          consequences: [{ stat: 'health', before: 5, after: 4 }],
        })}
      />,
    )
    const area = screen.getByLabelText('Consequences')
    const chip = area.firstElementChild as HTMLElement
    expect(chip.className).toContain('deltaNegative')
  })

  it('positive delta has deltaPositive class', () => {
    render(
      <MoveOutcomeCard
        {...makeProps({
          consequences: [{ stat: 'momentum', before: 2, after: 4 }],
        })}
      />,
    )
    const area = screen.getByLabelText('Consequences')
    const chip = area.firstElementChild as HTMLElement
    expect(chip.className).toContain('deltaPositive')
  })
})
