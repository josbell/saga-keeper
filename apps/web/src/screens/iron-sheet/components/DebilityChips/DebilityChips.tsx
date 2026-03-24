import styles from './DebilityChips.module.css'

export type DebilityKey =
  | 'wounded'
  | 'shaken'
  | 'unprepared'
  | 'encumbered'
  | 'maimed'
  | 'corrupted'
  | 'cursed'
  | 'tormented'
  | 'weak'

const DEBILITY_LABELS: Record<DebilityKey, string> = {
  wounded: 'Wounded',
  shaken: 'Shaken',
  unprepared: 'Unprepared',
  encumbered: 'Encumbered',
  maimed: 'Maimed',
  corrupted: 'Corrupted',
  cursed: 'Cursed',
  tormented: 'Tormented',
  weak: 'Weak',
}

const DEBILITY_ORDER: DebilityKey[] = [
  'wounded',
  'shaken',
  'unprepared',
  'encumbered',
  'maimed',
  'corrupted',
  'cursed',
  'tormented',
  'weak',
]

export interface DebilityChipsProps {
  debilities: Record<DebilityKey, boolean>
  onToggle: (key: DebilityKey) => void
}

export function DebilityChips({ debilities, onToggle }: DebilityChipsProps) {
  return (
    <section className={styles.section} aria-label="Debilities">
      <div className={styles.group} role="group" aria-label="Debilities">
        {DEBILITY_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={styles.chip}
            aria-pressed={debilities[key]}
            onClick={() => onToggle(key)}
          >
            {DEBILITY_LABELS[key]}
          </button>
        ))}
      </div>
    </section>
  )
}
