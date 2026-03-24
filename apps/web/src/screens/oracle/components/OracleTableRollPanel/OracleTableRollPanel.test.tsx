import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { OracleTable, OracleRoll } from '@saga-keeper/domain'
import { OracleTableRollPanel } from './OracleTableRollPanel'

const SMALL_TABLE: OracleTable = {
  id: 'test-table',
  rulesetId: 'ironsworn-v1',
  name: 'Test Table',
  category: 'core',
  entries: [
    { min: 1, max: 50, result: 'First Result' },
    { min: 51, max: 100, result: 'Second Result' },
  ],
}

const SINGLE_VALUE_TABLE: OracleTable = {
  id: 'single',
  rulesetId: 'ironsworn-v1',
  name: 'Single',
  category: 'core',
  entries: [
    { min: 1, max: 1, result: 'Only Result' },
    { min: 2, max: 100, result: 'Rest' },
  ],
}

function makeRoll(overrides: Partial<OracleRoll> = {}): OracleRoll {
  return {
    tableId: 'test-table',
    roll: 42,
    raw: 'First Result',
    timestamp: '2026-01-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('OracleTableRollPanel — no table selected', () => {
  it('renders a region with aria-label "Oracle Table Roll"', () => {
    render(<OracleTableRollPanel table={null} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByRole('region', { name: /oracle table roll/i })).toBeTruthy()
  })

  it('shows empty state prompt when table is null', () => {
    render(<OracleTableRollPanel table={null} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByText(/select a table/i)).toBeTruthy()
  })

  it('does not render a roll button when table is null', () => {
    render(<OracleTableRollPanel table={null} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('OracleTableRollPanel — table selected', () => {
  it('renders the table name as a heading', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /test table/i })).toBeTruthy()
  })

  it('renders a list of entries', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByRole('list')).toBeTruthy()
  })

  it('renders one list item per entry', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getAllByRole('listitem').length).toBe(2)
  })

  it('renders ranged entry as "1–50"', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByText('1–50')).toBeTruthy()
  })

  it('renders single-value entry range as just the number', () => {
    render(<OracleTableRollPanel table={SINGLE_VALUE_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('renders entry result text', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByText('First Result')).toBeTruthy()
  })

  it('renders a roll button', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByRole('button', { name: /roll on test table/i })).toBeTruthy()
  })

  it('roll button has type="button"', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.getByRole('button', { name: /roll on test table/i }).getAttribute('type')).toBe(
      'button'
    )
  })

  it('does not show result area when lastResult is null', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('does not show empty state prompt when table is provided', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={vi.fn()} />)
    expect(screen.queryByText(/select a table/i)).toBeNull()
  })
})

describe('OracleTableRollPanel — roll interaction', () => {
  it('clicking roll button calls onRoll', () => {
    const onRoll = vi.fn()
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={null} onRoll={onRoll} />)
    fireEvent.click(screen.getByRole('button', { name: /roll on test table/i }))
    expect(onRoll).toHaveBeenCalledTimes(1)
  })
})

describe('OracleTableRollPanel — result display', () => {
  it('renders result area when lastResult is provided', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={makeRoll()} onRoll={vi.fn()} />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows roll number in result', () => {
    render(
      <OracleTableRollPanel
        table={SMALL_TABLE}
        lastResult={makeRoll({ roll: 42 })}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText(/42/)).toBeTruthy()
  })

  it('shows raw result text in result', () => {
    render(
      <OracleTableRollPanel
        table={SMALL_TABLE}
        lastResult={makeRoll({ raw: 'First Result' })}
        onRoll={vi.fn()}
      />
    )
    expect(within(screen.getByRole('status')).getByText('First Result')).toBeTruthy()
  })

  it('result area has role="status"', () => {
    render(<OracleTableRollPanel table={SMALL_TABLE} lastResult={makeRoll()} onRoll={vi.fn()} />)
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
