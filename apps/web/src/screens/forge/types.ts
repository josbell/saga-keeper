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

export const INITIAL_DRAFT: ForgeDraft = {
  worldDescription: '',
  name: '',
  background: '',
  edge: 1,
  heart: 1,
  iron: 1,
  shadow: 1,
  wits: 1,
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
