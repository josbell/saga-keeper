import { Input, Textarea } from '@saga-keeper/ui'
import type { StepProps } from '../types'

export function NameBackgroundStep({ draft, onDraftChange }: StepProps) {
  return (
    <div className="name-background-step">
      <div className="name-background-step__field">
        <label htmlFor="character-name">Name</label>
        <Input
          id="character-name"
          value={draft.name}
          onChange={(e) => onDraftChange({ name: e.target.value })}
          placeholder="Your name"
        />
      </div>
      <div className="name-background-step__field">
        <label htmlFor="character-background">Background</label>
        <Textarea
          id="character-background"
          value={draft.background}
          onChange={(e) => onDraftChange({ background: e.target.value })}
          placeholder="Your background and history"
          rows={6}
        />
      </div>
    </div>
  )
}
