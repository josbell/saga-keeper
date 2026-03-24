import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'

export type StatKey = 'edge' | 'heart' | 'iron' | 'shadow' | 'wits'

export interface ForgeDraft {
  worldDescription: string
  name: string
  background: string
  edge: number
  heart: number
  iron: number
  shadow: number
  wits: number
  assetIds: string[]
  vow: IronswornVow | null
}

// Stats use 0 as the "unassigned" sentinel — budget tokens from [3,2,2,1,1]
// are placed on stats to set their final value. 0 means no token placed yet.
export const INITIAL_DRAFT: ForgeDraft = {
  worldDescription: '',
  name: '',
  background: '',
  edge: 0,
  heart: 0,
  iron: 0,
  shadow: 0,
  wits: 0,
  assetIds: [],
  vow: null,
}

export interface StepProps {
  draft: ForgeDraft
  onDraftChange: (patch: Partial<ForgeDraft>) => void
  onNext: () => void
  onBack: () => void
  stepIndex: number
  totalSteps: number
}
