import { useState } from 'react'
import { rollDice, type DiceResult } from './rollDice'
import styles from './DiceRoller.module.css'

export interface DiceRollerProps {
  statValue?: number
  statName?: string
  onRoll?: (result: DiceResult) => void
}

const OUTCOME_LABELS: Record<DiceResult['outcome'], string> = {
  'strong-hit': 'Strong Hit',
  'weak-hit': 'Weak Hit',
  miss: 'Miss',
}

export function DiceRoller({ statValue = 0, statName, onRoll }: DiceRollerProps) {
  const [result, setResult] = useState<DiceResult | null>(null)

  function handleRoll() {
    const r = rollDice(statValue)
    setResult(r)
    onRoll?.(r)
  }

  return (
    <div className={styles.roller}>
      {statName !== undefined && (
        <span className={styles.statName} data-testid="stat-name">
          {statName}
        </span>
      )}

      <button type="button" className={styles.rollButton} onClick={handleRoll}>
        Roll the Fate
      </button>

      {result !== null && (
        <div className={styles.result}>
          <span className={styles.die} data-testid="action-die">
            {result.actionDie}
          </span>
          <span className={styles.die} data-testid="challenge-die-1">
            {result.challengeDie1}
          </span>
          <span className={styles.die} data-testid="challenge-die-2">
            {result.challengeDie2}
          </span>
          <span
            className={styles.outcome}
            data-outcome={result.outcome}
            data-testid="outcome-label"
          >
            {OUTCOME_LABELS[result.outcome]}
          </span>
        </div>
      )}
    </div>
  )
}
