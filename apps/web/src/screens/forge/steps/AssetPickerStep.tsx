import { useRef } from 'react'
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
  const groupRefs = useRef<Map<AssetType, HTMLDivElement>>(new Map())

  function handleToggle(assetId: string) {
    if (draft.assetIds.includes(assetId)) {
      onDraftChange({ assetIds: draft.assetIds.filter((id) => id !== assetId) })
    } else if (!isMaxReached) {
      onDraftChange({ assetIds: [...draft.assetIds, assetId] })
    }
  }

  function handleGroupKeyDown(e: React.KeyboardEvent, type: AssetType, idx: number) {
    const container = groupRefs.current.get(type)
    if (!container) return
    const buttons = Array.from(container.querySelectorAll<HTMLElement>('button:not(:disabled)'))
    if (e.key === 'ArrowDown' && idx < buttons.length - 1) {
      e.preventDefault()
      buttons[idx + 1]?.focus()
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault()
      buttons[idx - 1]?.focus()
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
          <div
            ref={(el) => {
              if (el) groupRefs.current.set(type, el)
              else groupRefs.current.delete(type)
            }}
            className={styles.list}
          >
            {group.map((asset, idx) => {
              const isSelected = draft.assetIds.includes(asset.id)
              const isDisabled = isMaxReached && !isSelected
              return (
                <button
                  key={asset.id}
                  type="button"
                  data-testid={`asset-btn-${asset.id}`}
                  aria-pressed={isSelected}
                  disabled={isDisabled}
                  tabIndex={idx === 0 ? 0 : -1}
                  onClick={() => handleToggle(asset.id)}
                  onKeyDown={(e) => handleGroupKeyDown(e, type, idx)}
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
