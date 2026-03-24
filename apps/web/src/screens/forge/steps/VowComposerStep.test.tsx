import { render, screen, fireEvent } from '@testing-library/react'
import { VowComposerStep } from './VowComposerStep'
import { INITIAL_DRAFT } from '../types'
import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'

const VOW_RANKS: IronswornVow['rank'][] = [
  'troublesome',
  'dangerous',
  'formidable',
  'extreme',
  'epic',
]

function makeDraft(vow: IronswornVow | null = null) {
  return { ...INITIAL_DRAFT, vow }
}

describe('VowComposerStep — rendering', () => {
  it('renders a vow title input field', () => {
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    expect(screen.getByPlaceholderText(/vow/i)).toBeTruthy()
  })

  it('renders all 5 rank option buttons', () => {
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    for (const rank of VOW_RANKS) {
      expect(screen.getByRole('button', { name: new RegExp(rank, 'i') })).toBeTruthy()
    }
  })

  it('pre-fills title from draft.vow if present', () => {
    const vow: IronswornVow = {
      id: 'vow-1',
      title: 'Protect the village',
      rank: 'dangerous',
      progress: 0,
      fulfilled: false,
    }
    render(
      <VowComposerStep
        draft={makeDraft(vow)}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    const input = screen.getByPlaceholderText(/vow/i) as HTMLInputElement
    expect(input.value).toBe('Protect the village')
  })

  it('shows selected rank as aria-pressed="true"', () => {
    const vow: IronswornVow = {
      id: 'vow-1',
      title: 'Test',
      rank: 'formidable',
      progress: 0,
      fulfilled: false,
    }
    render(
      <VowComposerStep
        draft={makeDraft(vow)}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    const formidableBtn = screen.getByRole('button', { name: /formidable/i })
    expect(formidableBtn.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('VowComposerStep — interaction', () => {
  it('typing in title calls onDraftChange with updated vow.title', () => {
    const onDraftChange = vi.fn()
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    fireEvent.change(screen.getByPlaceholderText(/vow/i), {
      target: { value: 'Find the lost heir' },
    })
    const call = onDraftChange.mock.calls[0]![0] as { vow: IronswornVow }
    expect(call.vow.title).toBe('Find the lost heir')
  })

  it('selecting a rank calls onDraftChange with updated vow.rank', () => {
    const onDraftChange = vi.fn()
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /epic/i }))
    const call = onDraftChange.mock.calls[0]![0] as { vow: IronswornVow }
    expect(call.vow.rank).toBe('epic')
  })

  it('vow always includes progress: 0 and fulfilled: false', () => {
    const onDraftChange = vi.fn()
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /dangerous/i }))
    const call = onDraftChange.mock.calls[0]![0] as { vow: IronswornVow }
    expect(call.vow.progress).toBe(0)
    expect(call.vow.fulfilled).toBe(false)
  })

  it('vow id is a non-empty string', () => {
    const onDraftChange = vi.fn()
    render(
      <VowComposerStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={4}
        totalSteps={6}
      />
    )
    fireEvent.change(screen.getByPlaceholderText(/vow/i), { target: { value: 'My vow' } })
    const call = onDraftChange.mock.calls[0]![0] as { vow: IronswornVow }
    expect(typeof call.vow.id).toBe('string')
    expect(call.vow.id.length).toBeGreaterThan(0)
  })
})
