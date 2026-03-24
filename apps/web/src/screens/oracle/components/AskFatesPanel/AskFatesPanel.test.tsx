import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { FatesResult, Odds } from '@saga-keeper/domain'
import { AskFatesPanel } from './AskFatesPanel'

function makeFates(overrides: Partial<FatesResult> = {}): FatesResult {
  return {
    odds: 'fifty-fifty',
    roll: 42,
    result: true,
    extreme: false,
    timestamp: '2026-01-01T12:00:00.000Z',
    ...overrides,
  }
}

const ALL_ODDS: Odds[] = [
  'small-chance',
  'unlikely',
  'fifty-fifty',
  'likely',
  'almost-certain',
  'certain',
]

describe('AskFatesPanel — rendering', () => {
  it('renders a region with aria-label "Ask the Fates"', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('region', { name: /ask the fates/i })).toBeTruthy()
  })

  it('renders an odds group with role="group"', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('group', { name: /odds/i })).toBeTruthy()
  })

  it('renders exactly 6 odds pill buttons', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    const group = screen.getByRole('group', { name: /odds/i })
    const pills = group.querySelectorAll('button')
    expect(pills.length).toBe(6)
  })

  it('renders "Small Chance" pill', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: /small chance/i })).toBeTruthy()
  })

  it('renders "Certain" pill', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Certain' })).toBeTruthy()
  })

  it('renders a roll button', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: /consult the oracle/i })).toBeTruthy()
  })

  it('roll button is disabled when selectedOdds is null', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    const rollBtn = screen.getByRole('button', { name: /consult the oracle/i })
    expect(rollBtn).toBeTruthy()
    expect((rollBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('roll button is enabled when selectedOdds is set', () => {
    render(
      <AskFatesPanel
        selectedOdds="likely"
        lastFates={null}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    const rollBtn = screen.getByRole('button', { name: /consult the oracle/i })
    expect((rollBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('does not render result area when lastFates is null', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders result area when lastFates is provided', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates()}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('all pills have type="button"', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    const group = screen.getByRole('group', { name: /odds/i })
    const pills = group.querySelectorAll('button')
    pills.forEach((btn) => expect(btn.getAttribute('type')).toBe('button'))
  })

  it('roll button has type="button"', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: /consult the oracle/i }).getAttribute('type')).toBe(
      'button'
    )
  })
})

describe('AskFatesPanel — odds selection', () => {
  it('selected odds pill has aria-pressed="true"', () => {
    render(
      <AskFatesPanel
        selectedOdds="likely"
        lastFates={null}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Likely' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('unselected odds pills have aria-pressed="false"', () => {
    render(
      <AskFatesPanel
        selectedOdds="likely"
        lastFates={null}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    const group = screen.getByRole('group', { name: /odds/i })
    const pills = Array.from(group.querySelectorAll('button'))
    const unselected = pills.filter((b) => b.textContent !== 'Likely')
    unselected.forEach((btn) => expect(btn.getAttribute('aria-pressed')).toBe('false'))
  })

  it('all pills have aria-pressed="false" when selectedOdds is null', () => {
    render(
      <AskFatesPanel selectedOdds={null} lastFates={null} onOddsSelect={vi.fn()} onRoll={vi.fn()} />
    )
    const group = screen.getByRole('group', { name: /odds/i })
    const pills = group.querySelectorAll('button')
    pills.forEach((btn) => expect(btn.getAttribute('aria-pressed')).toBe('false'))
  })

  it.each(ALL_ODDS)('clicking "%s" pill calls onOddsSelect with that value', (odds) => {
    const onOddsSelect = vi.fn()
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={null}
        onOddsSelect={onOddsSelect}
        onRoll={vi.fn()}
      />
    )
    // Find button in odds group by aria-pressed (all pills are in the group)
    const group = screen.getByRole('group', { name: /odds/i })
    const pills = Array.from(group.querySelectorAll('button'))
    const ODDS_LABELS: Record<Odds, string> = {
      'small-chance': 'Small Chance',
      unlikely: 'Unlikely',
      'fifty-fifty': 'Fifty-Fifty',
      likely: 'Likely',
      'almost-certain': 'Almost Certain',
      certain: 'Certain',
    }
    const btn = pills.find((b) => b.textContent === ODDS_LABELS[odds])!
    fireEvent.click(btn)
    expect(onOddsSelect).toHaveBeenCalledWith(odds)
  })
})

describe('AskFatesPanel — roll button', () => {
  it('clicking roll button calls onRoll', () => {
    const onRoll = vi.fn()
    render(
      <AskFatesPanel
        selectedOdds="fifty-fifty"
        lastFates={null}
        onOddsSelect={vi.fn()}
        onRoll={onRoll}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /consult the oracle/i }))
    expect(onRoll).toHaveBeenCalledTimes(1)
  })
})

describe('AskFatesPanel — result display', () => {
  it('shows "Yes" when result is true', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ result: true })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText('Yes')).toBeTruthy()
  })

  it('shows "No" when result is false', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ result: false })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText('No')).toBeTruthy()
  })

  it('shows "Extreme" when extreme is true', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ extreme: true })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText(/extreme/i)).toBeTruthy()
  })

  it('does not show "Extreme" when extreme is false', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ extreme: false })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).queryByText(/extreme/i)).toBeNull()
  })

  it('shows the roll number', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ roll: 73 })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText(/73/)).toBeTruthy()
  })

  it('shows the odds label used', () => {
    render(
      <AskFatesPanel
        selectedOdds={null}
        lastFates={makeFates({ odds: 'unlikely' })}
        onOddsSelect={vi.fn()}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText(/unlikely/i)).toBeTruthy()
  })
})
