import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { OracleTable } from '@saga-keeper/domain'
import { OracleTableBrowser } from './OracleTableBrowser'

const TABLES: OracleTable[] = [
  { id: 'action', rulesetId: 'ironsworn-v1', name: 'Action', category: 'core', entries: [] },
  { id: 'theme', rulesetId: 'ironsworn-v1', name: 'Theme', category: 'core', entries: [] },
  { id: 'npc-role', rulesetId: 'ironsworn-v1', name: 'NPC Role', category: 'npc', entries: [] },
]

describe('OracleTableBrowser — rendering', () => {
  it('renders a navigation landmark with label "Oracle Tables"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: /oracle tables/i })).toBeTruthy()
  })

  it('renders one group per unique category', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    // 2 categories: core, npc
    expect(screen.getByText('Core')).toBeTruthy()
    expect(screen.getByText('NPC')).toBeTruthy()
  })

  it('renders table names as buttons', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Theme' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'NPC Role' })).toBeTruthy()
  })

  it('renders no table buttons when tables array is empty', () => {
    render(<OracleTableBrowser tables={[]} selectedTableId={null} onSelect={vi.fn()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('group header buttons have type="button"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtns = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-expanded') !== null)
    groupBtns.forEach((btn) => expect(btn.getAttribute('type')).toBe('button'))
  })

  it('table item buttons have type="button"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Action' }).getAttribute('type')).toBe('button')
  })
})

describe('OracleTableBrowser — expand/collapse', () => {
  it('group header has aria-expanded="true" by default', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtns = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-expanded') !== null)
    groupBtns.forEach((btn) => expect(btn.getAttribute('aria-expanded')).toBe('true'))
  })

  it('clicking group header sets aria-expanded to "false"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    fireEvent.click(groupBtn)
    expect(groupBtn.getAttribute('aria-expanded')).toBe('false')
  })

  it('clicking a collapsed group header re-expands it', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    fireEvent.click(groupBtn)
    fireEvent.click(groupBtn)
    expect(groupBtn.getAttribute('aria-expanded')).toBe('true')
  })

  it('collapsed group list has hidden attribute', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    fireEvent.click(groupBtn)
    const list = document.getElementById('oracle-group-core')!
    expect(list.hidden).toBe(true)
  })

  it('collapsing one group does not affect another group', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    fireEvent.click(groupBtn)
    expect(screen.getByRole('button', { name: 'NPC Role' })).toBeTruthy()
  })
})

describe('OracleTableBrowser — selection', () => {
  it('selected table button has aria-pressed="true"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId="action" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Action' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('unselected table buttons have aria-pressed="false"', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId="action" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Theme' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'NPC Role' }).getAttribute('aria-pressed')).toBe(
      'false'
    )
  })

  it('all table buttons have aria-pressed="false" when nothing is selected', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const tableBtns = ['Action', 'Theme', 'NPC Role'].map((n) =>
      screen.getByRole('button', { name: n })
    )
    tableBtns.forEach((btn) => expect(btn.getAttribute('aria-pressed')).toBe('false'))
  })

  it('clicking a table button calls onSelect with the table id', () => {
    const onSelect = vi.fn()
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(onSelect).toHaveBeenCalledWith('action')
  })

  it('clicking NPC Role calls onSelect with "npc-role"', () => {
    const onSelect = vi.fn()
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'NPC Role' }))
    expect(onSelect).toHaveBeenCalledWith('npc-role')
  })

  it('clicking a group header does not call onSelect', () => {
    const onSelect = vi.fn()
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={onSelect} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    fireEvent.click(groupBtn)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('OracleTableBrowser — accessibility', () => {
  it('group header controls its list via aria-controls', () => {
    render(<OracleTableBrowser tables={TABLES} selectedTableId={null} onSelect={vi.fn()} />)
    const groupBtn = screen.getAllByRole('button').find((b) => b.textContent?.includes('Core'))!
    const controlsId = groupBtn.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    expect(document.getElementById(controlsId!)).toBeTruthy()
  })
})
