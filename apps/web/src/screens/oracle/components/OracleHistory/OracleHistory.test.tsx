import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { OracleTable, OracleRoll, FatesResult } from '@saga-keeper/domain'
import { OracleHistory } from './OracleHistory'

const TABLES: OracleTable[] = [
  { id: 'action', rulesetId: 'ironsworn-v1', name: 'Action', category: 'core', entries: [] },
]

function makeRoll(overrides: Partial<OracleRoll> = {}): OracleRoll {
  return {
    tableId: 'action',
    roll: 42,
    raw: 'Betray',
    timestamp: '2026-01-01T12:00:00.000Z',
    ...overrides,
  }
}

function makeFates(overrides: Partial<FatesResult> = {}): FatesResult {
  return {
    odds: 'likely',
    roll: 30,
    result: true,
    extreme: false,
    timestamp: '2026-01-01T11:00:00.000Z',
    ...overrides,
  }
}

describe('OracleHistory — rendering', () => {
  it('renders a complementary landmark with label "Recent Revelations"', () => {
    render(
      <OracleHistory history={[]} fatesHistory={[]} tables={TABLES} onClearHistory={vi.fn()} />
    )
    expect(screen.getByRole('complementary', { name: /recent revelations/i })).toBeTruthy()
  })

  it('shows empty state message when both histories are empty', () => {
    render(
      <OracleHistory history={[]} fatesHistory={[]} tables={TABLES} onClearHistory={vi.fn()} />
    )
    expect(screen.getByText(/no revelations yet/i)).toBeTruthy()
  })

  it('does not render Clear History button when both histories are empty', () => {
    render(
      <OracleHistory history={[]} fatesHistory={[]} tables={TABLES} onClearHistory={vi.fn()} />
    )
    expect(screen.queryByRole('button', { name: /clear history/i })).toBeNull()
  })

  it('renders a list when there are entries', () => {
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByRole('list')).toBeTruthy()
  })

  it('renders one item per history entry (1 roll + 1 fates = 2 items)', () => {
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[makeFates()]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getAllByRole('listitem').length).toBe(2)
  })

  it('renders table name for oracle roll entries', () => {
    render(
      <OracleHistory
        history={[makeRoll({ tableId: 'action' })]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText('Action')).toBeTruthy()
  })

  it('renders roll number for oracle roll entry', () => {
    render(
      <OracleHistory
        history={[makeRoll({ roll: 42 })]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText(/42/)).toBeTruthy()
  })

  it('renders raw result text for oracle roll entry', () => {
    render(
      <OracleHistory
        history={[makeRoll({ raw: 'Betray' })]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText('Betray')).toBeTruthy()
  })

  it('renders "Ask the Fates" label for fates entries', () => {
    render(
      <OracleHistory
        history={[]}
        fatesHistory={[makeFates()]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText(/ask the fates/i)).toBeTruthy()
  })

  it('renders "Yes" for a fates result with result=true', () => {
    render(
      <OracleHistory
        history={[]}
        fatesHistory={[makeFates({ result: true })]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText('Yes')).toBeTruthy()
  })

  it('renders "No" for a fates result with result=false', () => {
    render(
      <OracleHistory
        history={[]}
        fatesHistory={[makeFates({ result: false })]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText('No')).toBeTruthy()
  })

  it('renders Extreme badge when extreme=true', () => {
    render(
      <OracleHistory
        history={[]}
        fatesHistory={[makeFates({ extreme: true })]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByText(/extreme/i)).toBeTruthy()
  })

  it('does not render Extreme badge when extreme=false', () => {
    render(
      <OracleHistory
        history={[]}
        fatesHistory={[makeFates({ extreme: false })]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.queryByText(/extreme/i)).toBeNull()
  })

  it('renders Clear History button when history is non-empty', () => {
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /clear history/i })).toBeTruthy()
  })

  it('Clear History button has type="button"', () => {
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /clear history/i }).getAttribute('type')).toBe(
      'button'
    )
  })

  it('list has aria-live="polite"', () => {
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    const list = screen.getByRole('list')
    expect(list.getAttribute('aria-live')).toBe('polite')
  })
})

describe('OracleHistory — sort order', () => {
  it('newer timestamp entry appears before older entry', () => {
    const newerRoll = makeRoll({ timestamp: '2026-01-01T13:00:00.000Z', raw: 'Strike' })
    const olderFates = makeFates({ timestamp: '2026-01-01T11:00:00.000Z' })
    render(
      <OracleHistory
        history={[newerRoll]}
        fatesHistory={[olderFates]}
        tables={TABLES}
        onClearHistory={vi.fn()}
      />
    )
    const items = screen.getAllByRole('listitem')
    // newer roll should be first — it has "Strike" text
    expect(within(items[0]!).getByText('Strike')).toBeTruthy()
  })
})

describe('OracleHistory — interaction', () => {
  it('clicking Clear History calls onClearHistory', () => {
    const onClearHistory = vi.fn()
    render(
      <OracleHistory
        history={[makeRoll()]}
        fatesHistory={[]}
        tables={TABLES}
        onClearHistory={onClearHistory}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /clear history/i }))
    expect(onClearHistory).toHaveBeenCalledTimes(1)
  })
})
