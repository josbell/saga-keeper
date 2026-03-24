import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps } from '../types'

export function AssetPickerStep({ draft, onDraftChange }: StepProps) {
  const assets = ironswornPlugin.assets.getAll()
  const maxSelected = 3
  const isMaxReached = draft.assetIds.length >= maxSelected

  function handleToggle(assetId: string) {
    if (draft.assetIds.includes(assetId)) {
      onDraftChange({ assetIds: draft.assetIds.filter((id) => id !== assetId) })
    } else if (!isMaxReached) {
      onDraftChange({ assetIds: [...draft.assetIds, assetId] })
    }
  }

  return (
    <div className="asset-picker-step">
      <div data-testid="asset-count" className="asset-picker-step__count">
        {draft.assetIds.length} / {maxSelected}
      </div>
      <div className="asset-picker-step__list">
        {assets.map((asset) => {
          const isSelected = draft.assetIds.includes(asset.id)
          const isDisabled = isMaxReached && !isSelected
          return (
            <button
              key={asset.id}
              type="button"
              data-testid={`asset-btn-${asset.id}`}
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => handleToggle(asset.id)}
              className="asset-picker-step__asset"
            >
              <span className="asset-picker-step__asset-name">{asset.name}</span>
              <span className="asset-picker-step__asset-type">{asset.type}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
