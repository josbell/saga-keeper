import { DiceRoller } from '@saga-keeper/ui'
import type { StatKey } from '../StatsGrid/StatsGrid'
import styles from './DiceRollerSection.module.css'

const STAT_LABELS: Record<StatKey, string> = {
  edge: 'Edge',
  heart: 'Heart',
  iron: 'Iron',
  shadow: 'Shadow',
  wits: 'Wits',
}

export interface DiceRollerSectionProps {
  selectedStat: StatKey | null
  statValue: number | null
}

export function DiceRollerSection({ selectedStat, statValue }: DiceRollerSectionProps) {
  return (
    <section className={styles.section} aria-label="Dice Roller">
      {selectedStat === null ? <p className={styles.prompt}>Select a stat above to roll</p> : null}
      <DiceRoller
        statValue={statValue ?? 0}
        {...(selectedStat ? { statName: STAT_LABELS[selectedStat] } : {})}
      />
    </section>
  )
}
