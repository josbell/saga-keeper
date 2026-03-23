import styles from './StatTrack.module.css'

export interface StatTrackProps {
  value: number
  max: number
  variant?: 'health' | 'spirit' | 'supply'
  onChange?: (value: number) => void
  readOnly?: boolean
}

export function StatTrack({
  value,
  max,
  variant = 'health',
  onChange,
  readOnly = false,
}: StatTrackProps) {
  const clampedValue = Math.min(value, max)
  return (
    <div className={styles.track} data-variant={variant}>
      {Array.from({ length: max }, (_, i) => {
        const pipValue = i + 1
        const filled = pipValue <= clampedValue
        return (
          <button
            key={i}
            type="button"
            className={styles.pip}
            aria-pressed={filled}
            aria-label={`Set to ${pipValue}`}
            onClick={readOnly ? undefined : () => onChange?.(pipValue)}
          />
        )
      })}
    </div>
  )
}
