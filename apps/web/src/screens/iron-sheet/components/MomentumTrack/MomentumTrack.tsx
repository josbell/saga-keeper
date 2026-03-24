import styles from './MomentumTrack.module.css'

export interface MomentumTrackProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
}

const MIN = -6
const MAX = 10
const STEPS = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i) // [-6, -5, ... 10]

export function MomentumTrack({ value, onChange, readOnly = false }: MomentumTrackProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (readOnly) return
    if (e.key === 'ArrowRight' && value < MAX) {
      e.preventDefault()
      onChange?.(value + 1)
    } else if (e.key === 'ArrowLeft' && value > MIN) {
      e.preventDefault()
      onChange?.(value - 1)
    }
  }

  return (
    <div
      className={styles.track}
      role="slider"
      aria-label="Momentum"
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={value}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {STEPS.map((step) => {
        const isNegative = step < 0
        const filled = step <= value
        return (
          <button
            key={step}
            type="button"
            className={styles.step}
            data-filled={filled}
            aria-label={String(step)}
            data-negative={isNegative || undefined}
            data-zero={step === 0 ? 'true' : undefined}
            onClick={readOnly ? undefined : () => onChange?.(step)}
            disabled={readOnly}
            tabIndex={-1}
          />
        )
      })}
    </div>
  )
}
