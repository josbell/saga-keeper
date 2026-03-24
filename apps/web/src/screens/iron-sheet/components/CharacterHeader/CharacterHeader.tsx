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
          <div className={styles.avatarPlaceholder} aria-label="Portrait placeholder">
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
          <div className={styles.xpDots}>
            {Array.from({ length: experienceEarned }, (_, i) => (
              <button
                key={i}
                type="button"
                className={styles.xpDot}
                aria-label={`XP ${i + 1}`}
                aria-pressed={i < experienceSpent}
                tabIndex={-1}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
