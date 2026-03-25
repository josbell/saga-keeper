import type { StatDelta, DiceRollRecord } from '@saga-keeper/domain'
import styles from './MoveOutcomeCard.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MoveOutcomeData {
  moveId: string
  moveName: string
  result: 'strong-hit' | 'weak-hit' | 'miss' | null
  match: boolean
  roll: DiceRollRecord | null
  consequences: StatDelta[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resultLabel(result: MoveOutcomeData['result']): string {
  if (result === 'strong-hit') return 'Strong Hit'
  if (result === 'weak-hit') return 'Weak Hit'
  if (result === 'miss') return 'Miss'
  return 'Resolved'
}

function badgeClass(result: MoveOutcomeData['result']): string {
  if (result === 'strong-hit') return `${styles.badge} ${styles.badgeStrongHit}`
  if (result === 'weak-hit') return `${styles.badge} ${styles.badgeWeakHit}`
  if (result === 'miss') return `${styles.badge} ${styles.badgeMiss}`
  return styles.badge
}

function deltaSign(d: StatDelta): number {
  return d.after - d.before
}

function deltaClass(sign: number): string {
  if (sign > 0) return `${styles.delta} ${styles.deltaPositive}`
  if (sign < 0) return `${styles.delta} ${styles.deltaNegative}`
  return `${styles.delta} ${styles.deltaNeutral}`
}

function formatStat(stat: string): string {
  return stat.charAt(0).toUpperCase() + stat.slice(1)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MoveOutcomeCard({
  moveName,
  result,
  match,
  roll,
  consequences,
}: MoveOutcomeData) {
  const label = resultLabel(result)

  return (
    <div
      className={styles.card}
      aria-label={`${moveName} — ${label}`}
      data-testid="move-outcome-card"
    >
      <div className={styles.header}>
        <span className={styles.moveName}>{moveName}</span>
        <div className={styles.badges}>
          {match && <span className={styles.matchPill}>Match</span>}
          <span className={badgeClass(result)}>{label}</span>
        </div>
      </div>

      <div className={styles.body}>
        {roll && (
          <div className={styles.diceRow} aria-label="Dice roll">
            <span className={styles.diceTotal}>{roll.actionDie}</span>
            {roll.modifier !== 0 && (
              <>
                <span className={styles.diceSep}>{roll.modifier > 0 ? '+' : '−'}</span>
                <span>{Math.abs(roll.modifier)}</span>
                <span className={styles.diceSep}>=</span>
                <span className={styles.diceTotal}>{roll.total}</span>
              </>
            )}
            <span className={styles.diceSep}>vs</span>
            <span className={styles.diceChallenge}>
              {roll.challengeDice[0]}, {roll.challengeDice[1]}
            </span>
          </div>
        )}

        {consequences.length > 0 && (
          <div className={styles.consequences} aria-label="Consequences">
            {consequences.map((d) => {
              const sign = deltaSign(d)
              return (
                <span key={d.stat} className={deltaClass(sign)}>
                  {formatStat(d.stat)} {sign >= 0 ? '+' : ''}
                  {sign}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
