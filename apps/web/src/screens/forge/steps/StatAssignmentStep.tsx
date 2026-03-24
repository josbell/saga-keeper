import { useState } from 'react'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps, StatKey } from '../types'
import styles from './StatAssignmentStep.module.css'

const STAT_KEYS: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

const STAT_META: Record<StatKey, { rune: string; desc: string }> = {
  edge: { rune: 'ᛖ', desc: 'Speed & ranged' },
  heart: { rune: 'ᚺ', desc: 'Courage & bonds' },
  iron: { rune: 'ᛁ', desc: 'Strength & combat' },
  shadow: { rune: 'ᛊ', desc: 'Deception & stealth' },
  wits: { rune: 'ᚹ', desc: 'Cunning & survival' },
}

// Each stat starts at 0 (unassigned sentinel). Placing a budget token sets the stat
// to the token's value. Pool = budget minus all token values already placed (> 0).
function computePool(draft: StepProps['draft']): number[] {
  const budget = [...ironswornPlugin.creation.statBudget]
  const assignedValues = STAT_KEYS.map((k) => draft[k]).filter((v) => v > 0)
  const pool = [...budget]
  for (const val of assignedValues) {
    const idx = pool.indexOf(val)
    if (idx !== -1) pool.splice(idx, 1)
  }
  return pool
}

export function StatAssignmentStep({ draft, onDraftChange }: StepProps) {
  const [selectedToken, setSelectedToken] = useState<number | null>(null)

  const pool = computePool(draft)

  function handleTokenClick(value: number) {
    setSelectedToken((prev) => (prev === value ? null : value))
  }

  function handleStatClick(stat: StatKey) {
    if (selectedToken !== null) {
      onDraftChange({ [stat]: selectedToken })
      setSelectedToken(null)
    } else if (draft[stat] > 0) {
      onDraftChange({ [stat]: 0 })
    }
  }

  return (
    <div className={styles.step}>
      {/* Value chip pool */}
      <div>
        <div className={styles.sectionHeading}>Available Values</div>
        <div data-testid="budget-pool" className={styles.pool}>
          <span className={styles.poolLabel}>Pool</span>
          {pool.map((value, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.chip}
              aria-pressed={selectedToken === value}
              onClick={() => handleTokenClick(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Stat grid */}
      <div>
        <div className={styles.sectionHeading}>Attributes</div>
        <div className={styles.statGrid}>
          {STAT_KEYS.map((stat) => {
            const { rune, desc } = STAT_META[stat]
            const isAssigned = draft[stat] > 0
            return (
              <div
                key={stat}
                data-testid={`stat-${stat}`}
                className={`${styles.statSlot}${isAssigned ? ' ' + styles.assigned : ''}`}
                onClick={() => handleStatClick(stat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleStatClick(stat)
                }}
              >
                <div className={styles.statRune}>{rune}</div>
                <div className={styles.statName}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                {isAssigned ? (
                  <div className={styles.statValue}>{draft[stat]}</div>
                ) : (
                  <div className={styles.statEmpty}>—</div>
                )}
                <div className={styles.statDesc}>{desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
