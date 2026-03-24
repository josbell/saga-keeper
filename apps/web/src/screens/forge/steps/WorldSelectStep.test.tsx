import { render, screen, fireEvent } from '@testing-library/react'
import { WorldSelectStep } from './WorldSelectStep'
import { INITIAL_DRAFT } from '../types'

function makeDraft(worldDescription = '') {
  return { ...INITIAL_DRAFT, worldDescription }
}

describe('WorldSelectStep — rendering', () => {
  it('renders a textarea for world description', () => {
    render(
      <WorldSelectStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={0}
        totalSteps={6}
      />
    )
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('pre-fills worldDescription from draft', () => {
    render(
      <WorldSelectStep
        draft={makeDraft('A harsh and unforgiving land')}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={0}
        totalSteps={6}
      />
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('A harsh and unforgiving land')
  })
})

describe('WorldSelectStep — interaction', () => {
  it('calls onDraftChange with updated worldDescription when user types', () => {
    const onDraftChange = vi.fn()
    render(
      <WorldSelectStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={0}
        totalSteps={6}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My world' } })
    expect(onDraftChange).toHaveBeenCalledWith({ worldDescription: 'My world' })
  })
})
