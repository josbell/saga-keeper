import styles from './OracleStrip.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OracleStripProps {
  tableId: string
  roll: number
  raw: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function formatTableName(tableId: string): string {
  // Compound tables use '+' separator in the id (e.g. "action+theme")
  // Simple tables are kebab-case (e.g. "settlement-name")
  const parts = tableId.split('+')
  return parts
    .map((part) => part.split('-').map(capitalize).join(' '))
    .join(' + ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OracleStrip({ tableId, roll, raw }: OracleStripProps) {
  const formattedName = formatTableName(tableId)

  return (
    <div
      className={styles.strip}
      aria-label={`Oracle: ${formattedName} — ${raw}`}
      data-testid="oracle-strip"
    >
      <span className={styles.icon} aria-hidden="true">
        🎲
      </span>
      <div className={styles.content}>
        <span className={styles.tableName}>{formattedName}</span>
        <span className={styles.raw}>{raw}</span>
        <span className={styles.roll}>{roll}</span>
      </div>
    </div>
  )
}
