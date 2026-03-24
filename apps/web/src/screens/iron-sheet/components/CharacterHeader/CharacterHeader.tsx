import styles from './CharacterHeader.module.css'

export interface CharacterHeaderProps {
  name: string
  epithet?: string
  portraitUrl?: string
  leadingVowTitle?: string
  experienceEarned: number
  experienceSpent: number
}

export function CharacterHeader({
  name,
  epithet,
  portraitUrl,
  leadingVowTitle,
  experienceEarned,
  experienceSpent,
}: CharacterHeaderProps) {
  return (
    <header className={styles.header}>
      {/* Avatar */}
      <div className={styles.avatar}>
        {portraitUrl ? (
          <img src={portraitUrl} alt={name} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarPlaceholder} role="img" aria-label="Portrait placeholder">
            ᚢ
          </div>
        )}
      </div>

      {/* Character info */}
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.epithet}>{epithet ?? '—'}</p>
        <p className={styles.vow}>
          {leadingVowTitle ?? 'No active vow'}
        </p>
      </div>

      {/* Rank + XP */}
      <div className={styles.rank}>
        {experienceEarned > 0 && (
          <div
            className={styles.xpDots}
            aria-label={`Experience: ${experienceSpent} of ${experienceEarned} XP spent`}
          >
            {Array.from({ length: experienceEarned }, (_, i) => (
              <span
                key={i}
                className={styles.xpDot}
                data-filled={i < experienceSpent}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
