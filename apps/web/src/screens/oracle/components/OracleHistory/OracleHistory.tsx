import type { OracleTable, OracleRoll, FatesResult } from '@saga-keeper/domain'
import styles from './OracleHistory.module.css'

type HistoryEntry = { kind: 'roll'; data: OracleRoll } | { kind: 'fates'; data: FatesResult }

const ODDS_LABELS: Record<string, string> = {
  'small-chance': 'Small Chance',
  unlikely: 'Unlikely',
  'fifty-fifty': 'Fifty-Fifty',
  likely: 'Likely',
  'almost-certain': 'Almost Certain',
  certain: 'Certain',
}

export interface OracleHistoryProps {
  history: OracleRoll[]
  fatesHistory: FatesResult[]
  tables: OracleTable[]
  onClearHistory: () => void
  className?: string | undefined
}

export function OracleHistory({
  history,
  fatesHistory,
  tables,
  onClearHistory,
  className,
}: OracleHistoryProps) {
  const isEmpty = history.length === 0 && fatesHistory.length === 0

  const combined: HistoryEntry[] = [
    ...history.map((r) => ({ kind: 'roll' as const, data: r })),
    ...fatesHistory.map((f) => ({ kind: 'fates' as const, data: f })),
  ].sort((a, b) => b.data.timestamp.localeCompare(a.data.timestamp))

  const tableNameById = Object.fromEntries(tables.map((t) => [t.id, t.name]))

  return (
    <aside
      className={[styles.panel, className].filter(Boolean).join(' ')}
      aria-label="Recent Revelations"
    >
      <div className={styles.header}>
        <h2 className={styles.heading}>Revelations</h2>
        {!isEmpty && (
          <button type="button" className={styles.clearBtn} onClick={onClearHistory}>
            Clear History
          </button>
        )}
      </div>

      {isEmpty ? (
        <p className={styles.empty}>No revelations yet</p>
      ) : (
        <ul className={styles.list} aria-label="Oracle history" aria-live="polite">
          {combined.map((entry, i) => (
            <li key={i} className={styles.item}>
              {entry.kind === 'roll' ? (
                <RollEntry
                  roll={entry.data}
                  tableName={tableNameById[entry.data.tableId] ?? entry.data.tableId}
                />
              ) : (
                <FatesEntry fates={entry.data} />
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

function RollEntry({ roll, tableName }: { roll: OracleRoll; tableName: string }) {
  return (
    <div className={styles.entry}>
      <div className={styles.entryMeta}>
        <span className={styles.entryLabel}>{tableName}</span>
        <span className={styles.entryRoll}>Roll: {roll.roll}</span>
      </div>
      <p className={styles.entryResult}>{roll.raw}</p>
      <span className={styles.entryTime}>{new Date(roll.timestamp).toLocaleTimeString()}</span>
    </div>
  )
}

function FatesEntry({ fates }: { fates: FatesResult }) {
  return (
    <div className={styles.entry}>
      <div className={styles.entryMeta}>
        <span className={styles.entryLabel}>Ask the Fates</span>
        <span className={styles.entryRoll}>Roll: {fates.roll}</span>
      </div>
      <div className={styles.fatesOutcome}>
        {fates.extreme && <span className={styles.extremeBadge}>Extreme</span>}
        <span className={styles.fatesAnswer}>{fates.result ? 'Yes' : 'No'}</span>
        <span className={styles.fatesOdds}>{ODDS_LABELS[fates.odds] ?? fates.odds}</span>
      </div>
      <span className={styles.entryTime}>{new Date(fates.timestamp).toLocaleTimeString()}</span>
    </div>
  )
}
