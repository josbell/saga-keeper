import type { OracleTable, OracleRoll } from '@saga-keeper/domain'
import styles from './OracleTableRollPanel.module.css'

export interface OracleTableRollPanelProps {
  table: OracleTable | null
  lastResult: OracleRoll | null
  onRoll: () => void
}

export function OracleTableRollPanel({ table, lastResult, onRoll }: OracleTableRollPanelProps) {
  return (
    <section className={styles.panel} aria-label="Oracle Table Roll">
      {table === null ? (
        <p className={styles.empty}>Select a table from the left to begin</p>
      ) : (
        <>
          <h2 className={styles.heading}>{table.name}</h2>

          <ul className={styles.entryList} aria-label={`${table.name} entries`}>
            {table.entries.map((entry, i) => (
              <li key={i} className={styles.entryItem}>
                <span className={styles.entryRange}>
                  {entry.min === entry.max ? String(entry.min) : `${entry.min}–${entry.max}`}
                </span>
                <span className={styles.entryResult}>{entry.result}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={styles.rollBtn}
            aria-label={`Roll on ${table.name}`}
            onClick={onRoll}
          >
            Roll on {table.name}
          </button>

          {lastResult !== null && (
            <div role="status" className={styles.result} aria-live="polite">
              <div className={styles.resultHeader}>
                <span className={styles.rollNumber}>Roll: {lastResult.roll}</span>
              </div>
              <p className={styles.resultText}>{lastResult.raw}</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
