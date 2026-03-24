import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps, StatKey } from '../types'
import styles from './ConfirmationStep.module.css'

const STAT_KEYS: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

const STAT_RUNES: Record<StatKey, string> = {
  edge: 'ᛖ',
  heart: 'ᚺ',
  iron: 'ᛁ',
  shadow: 'ᛊ',
  wits: 'ᚹ',
}

export function ConfirmationStep({ draft, onNext }: StepProps) {
  const allAssets = ironswornPlugin.assets.getAll()
  const selectedAssets = allAssets.filter((a) => draft.assetIds.includes(a.id))

  return (
    <div className={styles.step}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Identity</div>
        <div className={styles.characterName}>{draft.name || '—'}</div>
        <p className={styles.background}>{draft.background || '—'}</p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Stats</div>
        <div className={styles.statsGrid}>
          {STAT_KEYS.map((stat) => (
            <div key={stat} data-testid={`summary-${stat}`} className={styles.statCell}>
              <div className={styles.statCellRune}>{STAT_RUNES[stat]}</div>
              <div className={styles.statCellName}>
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </div>
              <div className={styles.statCellValue}>{draft[stat]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Assets</div>
        <ul className={styles.assetList}>
          {selectedAssets.map((asset) => (
            <li key={asset.id} className={styles.assetItem}>
              {asset.name}
            </li>
          ))}
        </ul>
      </div>

      {draft.vow && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Starting Vow</div>
          <p className={styles.vowTitle}>{draft.vow.title}</p>
          <p className={styles.vowRank}>
            {draft.vow.rank.charAt(0).toUpperCase() + draft.vow.rank.slice(1)}
          </p>
        </div>
      )}

      {draft.worldDescription && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Your World</div>
          <p className={styles.worldText}>{draft.worldDescription}</p>
        </div>
      )}

      <button type="button" onClick={onNext} className={styles.commitBtn}>
        Begin your journey
      </button>
    </div>
  )
}
