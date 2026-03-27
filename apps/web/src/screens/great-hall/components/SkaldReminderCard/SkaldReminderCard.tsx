import styles from './SkaldReminderCard.module.css'

export interface SkaldReminderCardProps {
  reminderText: string | null
}

const FALLBACK = 'Begin a new saga to receive counsel from the Skald.'

export function SkaldReminderCard({ reminderText }: SkaldReminderCardProps) {
  return (
    <section role="region" aria-label="Skald's Reminder" className={styles.card}>
      <p className={styles.label}>Skald's Reminder</p>
      <p className={styles.text}>{reminderText ?? FALLBACK}</p>
    </section>
  )
}
