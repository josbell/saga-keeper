import { render, screen, fireEvent } from '@testing-library/react'
import { AssetPickerStep } from './AssetPickerStep'
import { INITIAL_DRAFT } from '../types'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'

const allAssets = ironswornPlugin.assets.getAll()
const firstThreeIds = allAssets.slice(0, 3).map((a) => a.id)

function makeDraft(assetIds: string[] = []) {
  return { ...INITIAL_DRAFT, assetIds }
}

describe('AssetPickerStep — rendering', () => {
  it('renders all assets from ironswornPlugin.assets.getAll()', () => {
    render(
      <AssetPickerStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    for (const asset of allAssets) {
      expect(screen.getByText(asset.name)).toBeTruthy()
    }
  })

  it('shows "0 / 3 selected" count initially', () => {
    render(
      <AssetPickerStep
        draft={makeDraft()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    expect(screen.getByTestId('asset-count').textContent).toBe('0 / 3')
  })

  it('shows correct selected count when assets are pre-selected', () => {
    render(
      <AssetPickerStep
        draft={makeDraft([firstThreeIds[0]!])}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    expect(screen.getByTestId('asset-count').textContent).toBe('1 / 3')
  })

  it('marks selected assets with aria-pressed="true"', () => {
    render(
      <AssetPickerStep
        draft={makeDraft([firstThreeIds[0]!])}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    const btn = screen.getByTestId(`asset-btn-${firstThreeIds[0]}`)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('AssetPickerStep — selection', () => {
  it('clicking an asset adds its id to draft.assetIds via onDraftChange', () => {
    const onDraftChange = vi.fn()
    render(
      <AssetPickerStep
        draft={makeDraft()}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    fireEvent.click(screen.getByTestId(`asset-btn-${firstThreeIds[0]}`))
    expect(onDraftChange).toHaveBeenCalledWith({ assetIds: [firstThreeIds[0]] })
  })

  it('clicking a selected asset removes it from draft.assetIds', () => {
    const onDraftChange = vi.fn()
    render(
      <AssetPickerStep
        draft={makeDraft([firstThreeIds[0]!])}
        onDraftChange={onDraftChange}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    fireEvent.click(screen.getByTestId(`asset-btn-${firstThreeIds[0]}`))
    expect(onDraftChange).toHaveBeenCalledWith({ assetIds: [] })
  })

  it('4th asset button is disabled when 3 are already selected', () => {
    const fourthId = allAssets[3]!.id
    render(
      <AssetPickerStep
        draft={makeDraft(firstThreeIds)}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    const fourthBtn = screen.getByTestId(`asset-btn-${fourthId}`) as HTMLButtonElement
    expect(fourthBtn.disabled).toBe(true)
  })

  it('selected assets remain enabled when 3 are selected', () => {
    render(
      <AssetPickerStep
        draft={makeDraft(firstThreeIds)}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        stepIndex={3}
        totalSteps={6}
      />
    )
    const selectedBtn = screen.getByTestId(`asset-btn-${firstThreeIds[0]}`) as HTMLButtonElement
    expect(selectedBtn.disabled).toBe(false)
  })
})
