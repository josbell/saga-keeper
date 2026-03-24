import { useState } from 'react'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps, StatKey } from '../types'

const STAT_KEYS: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

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
      // If the stat already has a non-default value, return it to the pool first
      // (handled implicitly: computePool re-derives pool from draft)
      onDraftChange({ [stat]: selectedToken })
      setSelectedToken(null)
    } else if (draft[stat] > 0) {
      // Clear the stat back to unassigned (return token to pool)
      onDraftChange({ [stat]: 0 })
    }
  }

  return (
    <div className="stat-assignment-step">
      <div data-testid="budget-pool" className="stat-assignment-step__pool">
        {pool.map((value, idx) => (
          <button
            key={idx}
            type="button"
            aria-pressed={selectedToken === value}
            onClick={() => handleTokenClick(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="stat-assignment-step__stats">
        {STAT_KEYS.map((stat) => (
          <div
            key={stat}
            data-testid={`stat-${stat}`}
            className="stat-assignment-step__stat-row"
            onClick={() => handleStatClick(stat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleStatClick(stat)
            }}
          >
            <span className="stat-assignment-step__stat-label">
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </span>
            <span className="stat-assignment-step__stat-value">{draft[stat]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
