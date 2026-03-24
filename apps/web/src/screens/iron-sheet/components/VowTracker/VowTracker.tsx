import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'
import { Badge } from '@saga-keeper/ui'
import styles from './VowTracker.module.css'

const PROGRESS_BOXES = 10

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface VowTrackerProps {
  vows: IronswornVow[]
  onProgressChange: (vowId: string, progress: number) => void
}

export function VowTracker({ vows, onProgressChange }: VowTrackerProps) {
  return (
    <section className={styles.section} aria-label="Vows">
      {vows.map((vow) => (
        <article key={vow.id} className={styles.vowCard}>
          <div className={styles.vowHeader}>
            <h3 className={styles.vowTitle}>{vow.title}</h3>
            <Badge variant="debility" label={capitalize(vow.rank)} />
            {vow.fulfilled && (
              <span role="img" aria-label="Fulfilled" className={styles.fulfilled}>
                ✓
              </span>
            )}
          </div>
          <div className={styles.progressTrack}>
            {Array.from({ length: PROGRESS_BOXES }, (_, i) => {
              const boxNum = i + 1
              const filled = boxNum <= vow.progress
              const isFinal = i === PROGRESS_BOXES - 1
              const isComplete = vow.progress === PROGRESS_BOXES

              function handleClick() {
                // Clicking an already-fully-filled final box clears the track
                if (isFinal && isComplete) {
                  onProgressChange(vow.id, 0)
                } else {
                  onProgressChange(vow.id, boxNum)
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  className={styles.progressBox}
                  aria-pressed={filled}
                  aria-label={`${vow.title}: progress ${boxNum} of ${PROGRESS_BOXES}`}
                  data-complete={isFinal && isComplete ? 'true' : undefined}
                  onClick={handleClick}
                />
              )
            })}
          </div>
        </article>
      ))}
    </section>
  )
}
