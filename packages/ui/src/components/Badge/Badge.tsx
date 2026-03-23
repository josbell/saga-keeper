import styles from './Badge.module.css'

export interface BadgeProps {
  variant: 'active' | 'co-op' | 'saga-complete' | 'abandoned' | 'debility'
  label: string
}

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={styles.badge} data-variant={variant}>
      {label}
    </span>
  )
}
