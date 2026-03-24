import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { AssetType } from '@saga-keeper/domain'
import type { StepProps } from '../types'
import styles from './AssetPickerStep.module.css'

const TYPE_LABELS: Record<AssetType, string> = {
  companion: 'Companions',
  path: 'Paths',
  'combat-talent': 'Combat Talents',
  ritual: 'Rituals',
  custom: 'Custom',
}

const TYPE_ORDER: AssetType[] = ['path', 'companion', 'combat-talent', 'ritual', 'custom']

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

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    assets: assets.filter((a) => a.type === type),
  })).filter((g) => g.assets.length > 0)

  return (
    <div className={styles.step}>
      <div className={styles.countRow}>
        <span className={styles.countLabel}>Selected</span>
        <span data-testid="asset-count" className={styles.count}>
          {draft.assetIds.length} / {maxSelected}
        </span>
      </div>

      {grouped.map(({ type, assets: group }) => (
        <div key={type} className={styles.group}>
          <div className={styles.groupHeading}>{TYPE_LABELS[type]}</div>
          <div className={styles.list}>
            {group.map((asset) => {
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
                  <span className={styles.assetDesc}>{asset.description}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
