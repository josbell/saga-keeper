import { render, screen, fireEvent } from '@testing-library/react'
import { StatAssignmentStep } from './StatAssignmentStep'
import { INITIAL_DRAFT, type ForgeDraft } from '../types'

const DRAG_TYPE = 'application/x-forge-stat'

function makeDT(data: object) {
  const store = new Map<string, string>([[DRAG_TYPE, JSON.stringify(data)]])
  return {
    effectAllowed: 'move' as const,
    dataTransfer: {
      effectAllowed: 'move',
      setData: (type: string, value: string) => store.set(type, value),
      getData: (type: string) => store.get(type) ?? '',
    },
  }
}

// All stats at 1 by default — budget not yet distributed
function makeDraft(overrides?: Partial<ForgeDraft>) {
  return { ...INITIAL_DRAFT, ...overrides }
}

// A fully assigned draft: [3,2,2,1,1] distributed across stats
function makeAssignedDraft(): ForgeDraft {
  return { ...INITIAL_DRAFT, edge: 3, heart: 2, iron: 2, shadow: 1, wits: 1 }
}
// A partially assigned draft: only edge assigned
function makePartialDraft(): ForgeDraft {
  return { ...INITIAL_DRAFT, edge: 3 }
}

describe('StatAssignmentStep — rendering', () => {
  it('renders all 5 stat labels', () => {
    render(
      <StatAssignmentStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    expect(screen.getByText(/edge/i)).toBeTruthy()
    expect(screen.getByText(/heart/i)).toBeTruthy()
    expect(screen.getByText(/iron/i)).toBeTruthy()
    expect(screen.getByText(/shadow/i)).toBeTruthy()
    expect(screen.getByText(/wits/i)).toBeTruthy()
  })

  it('renders the budget pool with values 3, 2, 2, 1, 1', () => {
    render(
      <StatAssignmentStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    const pool = screen.getByTestId('budget-pool')
    expect(pool.querySelectorAll('button').length).toBe(5)
    // pool tokens should be 3, 2, 2, 1, 1
    const values = Array.from(pool.querySelectorAll('button')).map((b) => Number(b.textContent))
    expect(values.sort((a, b) => b - a)).toEqual([3, 2, 2, 1, 1])
  })

  it('shows current stat values from draft', () => {
    render(
      <StatAssignmentStep
        draft={makeAssignedDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    expect(screen.getByTestId('stat-edge').textContent).toContain('3')
    expect(screen.getByTestId('stat-heart').textContent).toContain('2')
    expect(screen.getByTestId('stat-iron').textContent).toContain('2')
  })

  it('pool is empty when all budget values are assigned', () => {
    render(
      <StatAssignmentStep
        draft={makeAssignedDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    const pool = screen.getByTestId('budget-pool')
    expect(pool.querySelectorAll('button').length).toBe(0)
  })
})

describe('StatAssignmentStep — assignment', () => {
  it('clicking a budget token then a stat row assigns that value to the stat', () => {
    const onDraftChange = vi.fn()
    render(
      <StatAssignmentStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    // Click the "3" token
    const pool = screen.getByTestId('budget-pool')
    const tokenThree = Array.from(pool.querySelectorAll('button')).find(
      (b) => b.textContent === '3'
    )!
    fireEvent.click(tokenThree)
    // Click the Edge stat row
    fireEvent.click(screen.getByTestId('stat-edge'))
    expect(onDraftChange).toHaveBeenCalledWith({ edge: 3 })
  })

  it('clicking a budget token selects it (highlights)', () => {
    render(
      <StatAssignmentStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    const pool = screen.getByTestId('budget-pool')
    const tokenThree = Array.from(pool.querySelectorAll('button')).find(
      (b) => b.textContent === '3'
    )!
    fireEvent.click(tokenThree)
    expect(tokenThree.getAttribute('aria-pressed')).toBe('true')
  })

  it('clicking an assigned stat row clears it to 0 (unassigned)', () => {
    const onDraftChange = vi.fn()
    render(
      <StatAssignmentStep
        draft={makeAssignedDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={2}
        totalSteps={6}
      />
    )
    // Click edge stat (assigned to 3) — should clear it to 0 (unassigned)
    fireEvent.click(screen.getByTestId('stat-edge'))
    expect(onDraftChange).toHaveBeenCalledWith({ edge: 0 })
  })
})

describe('StatAssignmentStep — drag and drop', () => {
  const defaultProps = {
    onNext: vi.fn(),
    onBack: vi.fn(),
    stepIndex: 2,
    totalSteps: 6,
  }

  it('dragging a pool chip onto a stat slot assigns the value', () => {
    const onDraftChange = vi.fn()
    render(
      <StatAssignmentStep draft={makeDraft()} onDraftChange={onDraftChange} {...defaultProps} />
    )
    const statSlot = screen.getByTestId('stat-edge')
    fireEvent.dragStart(
      screen.getByTestId('budget-pool').querySelector('button')!,
      makeDT({ kind: 'pool', value: 3 })
    )
    fireEvent.dragOver(statSlot)
    fireEvent.drop(statSlot, makeDT({ kind: 'pool', value: 3 }))
    expect(onDraftChange).toHaveBeenCalledWith({ edge: 3 })
  })

  it('dragging an assigned stat onto another stat swaps the values', () => {
    const onDraftChange = vi.fn()
    render(
      <StatAssignmentStep
        draft={makeAssignedDraft()}
        onDraftChange={onDraftChange}
        {...defaultProps}
      />
    )
    const heartSlot = screen.getByTestId('stat-heart')
    fireEvent.dragStart(
      screen.getByTestId('stat-edge'),
      makeDT({ kind: 'stat', key: 'edge', value: 3 })
    )
    fireEvent.dragOver(heartSlot)
    fireEvent.drop(heartSlot, makeDT({ kind: 'stat', key: 'edge', value: 3 }))
    // edge gets heart's old value (2), heart gets edge's dragged value (3)
    expect(onDraftChange).toHaveBeenCalledWith({ edge: 2, heart: 3 })
  })

  it('dragging an assigned stat onto the pool clears the stat to 0', () => {
    const onDraftChange = vi.fn()
    render(
      <StatAssignmentStep
        draft={makeAssignedDraft()}
        onDraftChange={onDraftChange}
        {...defaultProps}
      />
    )
    const pool = screen.getByTestId('budget-pool')
    fireEvent.dragStart(
      screen.getByTestId('stat-edge'),
      makeDT({ kind: 'stat', key: 'edge', value: 3 })
    )
    fireEvent.dragOver(pool)
    fireEvent.drop(pool, makeDT({ kind: 'stat', key: 'edge', value: 3 }))
    expect(onDraftChange).toHaveBeenCalledWith({ edge: 0 })
  })
})
