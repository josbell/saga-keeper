import { Textarea } from '@saga-keeper/ui'
import type { StepProps } from '../types'
import styles from './WorldSelectStep.module.css'

export function WorldSelectStep({ draft, onDraftChange }: StepProps) {
  return (
    <div className={styles.step}>
      <p className={styles.prompt}>
        Describe the Ironlands you inhabit — its people, its perils, and its truths.
      </p>
      <label htmlFor="world-description" className={styles.label}>
        World Description
      </label>
      <Textarea
        id="world-description"
        value={draft.worldDescription}
        onChange={(e) => onDraftChange({ worldDescription: e.target.value })}
        placeholder="The Ironlands are a harsh and unforgiving land..."
        rows={6}
      />
    </div>
  )
}
