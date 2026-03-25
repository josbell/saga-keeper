import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkaldOraclePopover } from './SkaldOraclePopover'
import { useGameStore } from '@/store'

vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useGameStore).mockImplementation((selector: (s: any) => unknown) => {
    const state = {
      draft: { tableId: null, odds: null },
      lastFates: null,
      lastResult: null,
      history: [],
      fatesHistory: [],
      setDraft: vi.fn(),
      recordFates: vi.fn(),
      recordOracleRoll: vi.fn(),
      clearHistory: vi.fn(),
      ...overrides,
    }
    return selector(state)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setupStore()
})

describe('SkaldOraclePopover — visibility', () => {
  it('does not render when isOpen is false', () => {
    render(<SkaldOraclePopover isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders when isOpen is true', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('has aria-modal="true"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
  })

  it('has aria-label "Oracle"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /oracle/i })).toBeTruthy()
  })

  it('has id="skald-oracle-popover"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog').id).toBe('skald-oracle-popover')
  })

  it('pressing Escape calls onClose', () => {
    const onClose = vi.fn()
    render(<SkaldOraclePopover isOpen onClose={onClose} />)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('SkaldOraclePopover — tab navigation', () => {
  it('renders three tab buttons: Ask Fates, Browse Tables, Recent', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /ask fates/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /browse tables/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /recent/i })).toBeTruthy()
  })

  it('Ask Fates tab is selected by default', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    const tab = screen.getByRole('tab', { name: /ask fates/i })
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('inactive tabs have aria-selected="false"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /browse tables/i }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByRole('tab', { name: /recent/i }).getAttribute('aria-selected')).toBe('false')
  })

  it('clicking Browse Tables activates that tab', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /browse tables/i }))
    expect(screen.getByRole('tab', { name: /browse tables/i }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: /ask fates/i }).getAttribute('aria-selected')).toBe('false')
  })

  it('tab buttons have role="tab"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)
  })

  it('tab panels have role="tabpanel"', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('tabpanel')).toBeTruthy()
  })

  it('active tabpanel aria-labelledby matches active tab id', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('oracle-tab-ask-fates')
  })

  it('tabpanel aria-labelledby updates when switching to Browse Tables', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /browse tables/i }))
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('oracle-tab-browse-tables')
  })
})

describe('SkaldOraclePopover — Ask Fates tab', () => {
  it('renders 6 odds pills', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    // The AskFatesPanel renders 6 odds buttons
    const oddsBtns = screen.getAllByRole('button', { name: /small chance|unlikely|fifty-fifty|likely|almost certain|certain/i })
    expect(oddsBtns.length).toBe(6)
  })

  it('Consult button is disabled when no odds selected', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    const consultBtn = screen.getByRole('button', { name: /consult the oracle/i }) as HTMLButtonElement
    expect(consultBtn.disabled).toBe(true)
  })

  it('shows last fates result when lastFates is set', () => {
    setupStore({
      lastFates: {
        odds: 'likely',
        roll: 45,
        result: true,
        extreme: false,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    })
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    // "Yes" appears as the result answer (case-sensitive, standalone)
    expect(screen.getByText('Yes')).toBeTruthy()
  })
})

describe('SkaldOraclePopover — Recent tab', () => {
  it('shows empty state when history is empty', () => {
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /recent/i }))
    expect(screen.getByText(/no revelations yet/i)).toBeTruthy()
  })

  it('shows oracle roll entries in recent tab', () => {
    setupStore({
      history: [
        { tableId: 'action', roll: 42, raw: 'Inspect', timestamp: '2026-01-01T00:00:00.000Z' },
      ],
    })
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /recent/i }))
    expect(screen.getByText('Inspect')).toBeTruthy()
  })

  it('shows fates entries in recent tab', () => {
    setupStore({
      fatesHistory: [
        { odds: 'unlikely', roll: 80, result: false, extreme: false, timestamp: '2026-01-01T00:00:00.000Z' },
      ],
    })
    render(<SkaldOraclePopover isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /recent/i }))
    // "No" appears as the result (standalone text)
    expect(screen.getByText('No')).toBeTruthy()
  })
})

describe('SkaldOraclePopover — focus management', () => {
  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const onClose = vi.fn()
    const { rerender } = render(<SkaldOraclePopover isOpen onClose={onClose} />)
    // Close the popover
    rerender(<SkaldOraclePopover isOpen={false} onClose={onClose} />)

    expect(document.activeElement).toBe(trigger)
    document.body.removeChild(trigger)
  })
})
