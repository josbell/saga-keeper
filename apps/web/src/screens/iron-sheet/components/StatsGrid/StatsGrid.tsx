import styles from './StatsGrid.module.css'

export type StatKey = 'edge' | 'heart' | 'iron' | 'shadow' | 'wits'

interface StatMeta {
  label: string
  rune: string
}

const STAT_META: Record<StatKey, StatMeta> = {
  edge: { label: 'Edge', rune: 'ᛖ' },
  heart: { label: 'Heart', rune: 'ᚺ' },
  iron: { label: 'Iron', rune: 'ᛁ' },
  shadow: { label: 'Shadow', rune: 'ᛊ' },
  wits: { label: 'Wits', rune: 'ᚹ' },
}

const STAT_ORDER: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

export interface StatsGridProps {
  edge: number
  heart: number
  iron: number
  shadow: number
  wits: number
  selectedStat: StatKey | null
  onStatSelect: (stat: StatKey) => void
}

export function StatsGrid({
  edge,
  heart,
  iron,
  shadow,
  wits,
  selectedStat,
  onStatSelect,
}: StatsGridProps) {
  const values: Record<StatKey, number> = { edge, heart, iron, shadow, wits }

  return (
    <section className={styles.section} aria-label="Character Stats">
      <div className={styles.grid}>
        {STAT_ORDER.map((key) => {
          const { label, rune } = STAT_META[key]
          const value = values[key]
          const selected = selectedStat === key
          return (
            <button
              key={key}
              type="button"
              className={styles.stone}
              aria-pressed={selected}
              aria-label={`${label} ${value}`}
              data-testid={`stat-${key}`}
              data-selected={selected || undefined}
              onClick={() => onStatSelect(key)}
            >
              <span className={styles.rune} aria-hidden="true">
                {rune}
              </span>
              <span className={styles.name}>{label}</span>
              <span className={styles.value}>{value}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
