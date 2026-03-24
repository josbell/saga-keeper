import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationStep } from './ConfirmationStep'
import { INITIAL_DRAFT, type ForgeDraft } from '../types'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'

const allAssets = ironswornPlugin.assets.getAll()
const firstThreeIds = allAssets.slice(0, 3).map((a) => a.id)

function makeFullDraft(): ForgeDraft {
  return {
    ...INITIAL_DRAFT,
    worldDescription: 'A land of iron and shadow',
    name: 'Aldric',
    background: 'A wandering scout from the Havens',
    edge: 3,
    heart: 2,
    iron: 2,
    shadow: 1,
    wits: 1,
    assetIds: firstThreeIds,
    vow: {
      id: 'vow-1',
      title: 'Protect the village',
      rank: 'dangerous',
      progress: 0,
      fulfilled: false,
    },
  }
}

describe('ConfirmationStep — rendering', () => {
  it('renders the character name', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    expect(screen.getByText('Aldric')).toBeTruthy()
  })

  it('renders the background text', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    expect(screen.getByText('A wandering scout from the Havens')).toBeTruthy()
  })

  it('renders all 5 stat values', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    expect(screen.getByTestId('summary-edge').textContent).toContain('3')
    expect(screen.getByTestId('summary-heart').textContent).toContain('2')
    expect(screen.getByTestId('summary-iron').textContent).toContain('2')
    expect(screen.getByTestId('summary-shadow').textContent).toContain('1')
    expect(screen.getByTestId('summary-wits').textContent).toContain('1')
  })

  it('renders the 3 selected asset names', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    for (const id of firstThreeIds) {
      const asset = allAssets.find((a) => a.id === id)!
      expect(screen.getByText(asset.name)).toBeTruthy()
    }
  })

  it('renders the vow title and rank', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    expect(screen.getByText('Protect the village')).toBeTruthy()
    expect(screen.getByText(/dangerous/i)).toBeTruthy()
  })

  it('renders a "Begin your journey" commit button', () => {
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    expect(screen.getByRole('button', { name: /begin your journey/i })).toBeTruthy()
  })

  it('calls onNext when commit button is clicked', () => {
    const onNext = vi.fn()
    render(
      <ConfirmationStep
        draft={makeFullDraft()}
        onDraftChange={vi.fn()}
        onNext={onNext}
        onBack={vi.fn()}
        stepIndex={5}
        totalSteps={6}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /begin your journey/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
