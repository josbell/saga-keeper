import type { CharacterState } from '@saga-keeper/domain'
import type { IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import styles from './SkaldLeftSidebar.module.css'

interface SkaldLeftSidebarProps {
  character: CharacterState | null
}

export function SkaldLeftSidebar({ character }: SkaldLeftSidebarProps) {
  const data = character
    ? (character.data as unknown as IronswornCharacterData)
    : null

  return (
    <>
      {/* Character card */}
      <div className={styles.charCard}>
        {character && data ? (
          <>
            <h2 className={styles.charName}>{character.name}</h2>
            {character.epithet && (
              <p className={styles.charEpithet}>{character.epithet}</p>
            )}
            <div className={styles.statBars}>
              <StatBar label="Health" value={data.health} min={0} max={5} />
              <StatBar label="Spirit" value={data.spirit} min={0} max={5} />
              <StatBar label="Momentum" value={data.momentum} min={-6} max={10} />
            </div>
          </>
        ) : (
          <p className={styles.noChar}>No character loaded</p>
        )}
      </div>

      {/* Session list */}
      <section className={styles.sessionSection} aria-label="Sessions">
        <h3 className={styles.sectionLabel}>Sessions</h3>
        <ul className={styles.sessionList}>
          <li className={styles.sessionItem} aria-current="true">
            <span className={styles.sessionIcon} aria-hidden="true">🔥</span>
            Current Session
          </li>
        </ul>
      </section>
    </>
  )
}

interface StatBarProps {
  label: string
  value: number
  min: number
  max: number
}

function StatBar({ label, value, min, max }: StatBarProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  const clampedPct = Math.max(0, Math.min(100, pct))

  return (
    <div className={styles.statBarRow} data-testid={`stat-bar-${label.toLowerCase()}`}>
      <span className={styles.statBarLabel}>{label.slice(0, 2).toUpperCase()}</span>
      <div
        className={styles.statBarTrack}
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      >
        <div className={`${styles.statBarFill} ${styles[label.toLowerCase() as 'health' | 'spirit' | 'momentum']}`} style={{ width: `${clampedPct}%` }} />
      </div>
      <span className={styles.statBarNum}>{value}</span>
    </div>
  )
}
