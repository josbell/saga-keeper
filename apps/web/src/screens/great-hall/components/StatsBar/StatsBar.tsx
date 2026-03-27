import styles from './StatsBar.module.css'

export interface StatsBarProps {
  campaigns: number
  characters: number
  vowsSworn: number
  vowsFulfilled: number
  sessionsPlayed: number
}

const STATS = [
  { key: 'campaigns', label: 'Campaigns', testId: 'stat-campaigns' },
  { key: 'characters', label: 'Characters', testId: 'stat-characters' },
  { key: 'vowsSworn', label: 'Vows Sworn', testId: 'stat-vows-sworn' },
  { key: 'vowsFulfilled', label: 'Vows Fulfilled', testId: 'stat-vows-fulfilled' },
  { key: 'sessionsPlayed', label: 'Sessions Played', testId: 'stat-sessions-played' },
] as const

export function StatsBar({ campaigns, characters, vowsSworn, vowsFulfilled, sessionsPlayed }: StatsBarProps) {
  const values: Record<string, number> = { campaigns, characters, vowsSworn, vowsFulfilled, sessionsPlayed }

  return (
    <div role="region" aria-label="Campaign statistics" className={styles.statsBar}>
      {STATS.map(({ key, label, testId }) => (
        <div key={key} className={styles.stat} data-stat={key} data-testid={testId}>
          <span className={styles.statVal} data-stat-val>{values[key]}</span>
          <span className={styles.statLabel}>{label}</span>
        </div>
      ))}
    </div>
  )
}
