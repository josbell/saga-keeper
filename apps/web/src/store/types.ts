import type { Odds } from '@saga-keeper/domain'

/** Current phase of a Skald turn — drives UI loading states on the Skald screen. */
export type TurnPhase = 'idle' | 'waiting-for-ai' | 'streaming' | 'move-pending' | 'error'

/** A displayable item in the Skald chat feed. */
export interface SkaldMessage {
  id: string
  role: 'player' | 'skald' | 'system'
  content: string
  turnId?: string
  timestamp: string
}

/** Transient oracle panel state — holds selections before a roll is committed. */
export interface OracleDraft {
  tableId: string | null
  odds: Odds | null
}
