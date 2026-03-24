import { render, screen, fireEvent } from '@testing-library/react'
import { NameBackgroundStep } from './NameBackgroundStep'
import { INITIAL_DRAFT } from '../types'

function makeDraft(name = '', background = '') {
  return { ...INITIAL_DRAFT, name, background }
}

describe('NameBackgroundStep — rendering', () => {
  it('renders a name input field', () => {
    render(
      <NameBackgroundStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    expect(screen.getByPlaceholderText(/name/i)).toBeTruthy()
  })

  it('renders a background textarea', () => {
    render(
      <NameBackgroundStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    expect(screen.getByRole('textbox', { name: /background/i })).toBeTruthy()
  })

  it('pre-fills name from draft', () => {
    render(
      <NameBackgroundStep
        draft={makeDraft('Aldric')}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    const input = screen.getByPlaceholderText(/name/i) as HTMLInputElement
    expect(input.value).toBe('Aldric')
  })

  it('pre-fills background from draft', () => {
    render(
      <NameBackgroundStep
        draft={makeDraft('', 'A wandering scout from the Havens')}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    const textarea = screen.getByRole('textbox', { name: /background/i }) as HTMLTextAreaElement
    expect(textarea.value).toBe('A wandering scout from the Havens')
  })
})

describe('NameBackgroundStep — interaction', () => {
  it('calls onDraftChange with updated name when user types in name field', () => {
    const onDraftChange = vi.fn()
    render(
      <NameBackgroundStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Kira' } })
    expect(onDraftChange).toHaveBeenCalledWith({ name: 'Kira' })
  })

  it('calls onDraftChange with updated background when user types in background field', () => {
    const onDraftChange = vi.fn()
    render(
      <NameBackgroundStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={1}
        totalSteps={6}
      />
    )
    fireEvent.change(screen.getByRole('textbox', { name: /background/i }), {
      target: { value: 'Born in the deep forests' },
    })
    expect(onDraftChange).toHaveBeenCalledWith({ background: 'Born in the deep forests' })
  })
})
