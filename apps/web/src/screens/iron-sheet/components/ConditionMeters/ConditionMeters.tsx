import { StatTrack } from '@saga-keeper/ui'
import { MomentumTrack } from '../MomentumTrack/MomentumTrack'
import styles from './ConditionMeters.module.css'

export interface ConditionMetersProps {
  health: number
  spirit: number
  supply: number
  momentum: number
  onHealthChange: (value: number) => void
  onSpiritChange: (value: number) => void
  onSupplyChange: (value: number) => void
  onMomentumChange: (value: number) => void
}

export function ConditionMeters({
  health,
  spirit,
  supply,
  momentum,
  onHealthChange,
  onSpiritChange,
  onSupplyChange,
  onMomentumChange,
}: ConditionMetersProps) {
  return (
    <section className={styles.section} aria-label="Condition Meters">
      <div className={styles.grid}>
        <div className={styles.meter}>
          <p className={styles.label}>Health</p>
          <StatTrack value={health} max={5} variant="health" onChange={onHealthChange} />
        </div>
        <div className={styles.meter}>
          <p className={styles.label}>Spirit</p>
          <StatTrack value={spirit} max={5} variant="spirit" onChange={onSpiritChange} />
        </div>
        <div className={styles.meter}>
          <p className={styles.label}>Supply</p>
          <StatTrack value={supply} max={5} variant="supply" onChange={onSupplyChange} />
        </div>
        <div className={styles.meter}>
          <p className={styles.label}>Momentum</p>
          <MomentumTrack value={momentum} onChange={onMomentumChange} />
        </div>
      </div>
    </section>
  )
}
