import { Textarea } from '@saga-keeper/ui'
import type { StepProps } from '../types'

export function WorldSelectStep({ draft, onDraftChange }: StepProps) {
  return (
    <div className="world-select-step">
      <p>Describe the Ironlands you inhabit — its people, its perils, and its truths.</p>
      <Textarea
        value={draft.worldDescription}
        onChange={(e) => onDraftChange({ worldDescription: e.target.value })}
        placeholder="The Ironlands are a harsh and unforgiving land..."
        rows={6}
      />
    </div>
  )
}
