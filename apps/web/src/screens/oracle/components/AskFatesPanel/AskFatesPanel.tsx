import type { FatesResult, Odds } from '@saga-keeper/domain'
import styles from './AskFatesPanel.module.css'

const ODDS_ORDER: Odds[] = [
  'small-chance',
  'unlikely',
  'fifty-fifty',
  'likely',
  'almost-certain',
  'certain',
]

const ODDS_LABELS: Record<Odds, string> = {
  'small-chance': 'Small Chance',
  unlikely: 'Unlikely',
  'fifty-fifty': 'Fifty-Fifty',
  likely: 'Likely',
  'almost-certain': 'Almost Certain',
  certain: 'Certain',
}

export interface AskFatesPanelProps {
  selectedOdds: Odds | null
  lastFates: FatesResult | null
  onOddsSelect: (odds: Odds) => void
  onRoll: () => void
}

export function AskFatesPanel({
  selectedOdds,
  lastFates,
  onOddsSelect,
  onRoll,
}: AskFatesPanelProps) {
  return (
    <section className={styles.panel} aria-label="Ask the Fates">
      <h2 className={styles.heading}>Ask the Fates</h2>
      <p className={styles.intro}>Choose the odds and consult the oracle for a yes or no answer.</p>

      <div role="group" aria-label="Odds" className={styles.oddsGroup}>
        {ODDS_ORDER.map((odds) => (
          <button
            key={odds}
            type="button"
            className={styles.oddsPill}
            aria-pressed={selectedOdds === odds}
            onClick={() => onOddsSelect(odds)}
          >
            {ODDS_LABELS[odds]}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.rollBtn}
        disabled={selectedOdds === null}
        onClick={onRoll}
      >
        Consult the Oracle
      </button>

      {lastFates !== null && (
        <div role="status" className={styles.result} aria-live="polite">
          <div className={styles.resultHeader}>
            <span className={styles.oddsLabel}>{ODDS_LABELS[lastFates.odds]}</span>
            <span className={styles.rollNumber}>Roll: {lastFates.roll}</span>
          </div>
          <div className={styles.resultOutcome}>
            {lastFates.extreme && <span className={styles.extremeBadge}>Extreme</span>}
            <span className={styles.resultAnswer}>{lastFates.result ? 'Yes' : 'No'}</span>
          </div>
        </div>
      )}
    </section>
  )
}
