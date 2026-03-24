import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps } from '../types'
import styles from './AssetPickerStep.module.css'

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
    <div className={styles.step}>
      <div className={styles.countRow}>
        <span className={styles.countLabel}>Selected</span>
        <span data-testid="asset-count" className={styles.count}>
          {draft.assetIds.length} / {maxSelected}
        </span>
      </div>
      <div className={styles.list}>
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
              className={styles.assetBtn}
            >
              <span className={styles.assetName}>{asset.name}</span>
              <span className={styles.assetType}>{asset.type}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
