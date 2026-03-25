import type { Odds } from '@saga-keeper/domain'

/**
 * Current phase of a Skald turn — drives UI loading states on the Skald screen.
 *
 * resolving     — processTurn() is in-flight (offline: instant; AI: awaiting response).
 *                 Input is blocked; no streaming indicator shown.
 * waiting-for-ai — AI gateway accepted the request and is generating a response.
 * streaming     — AI response tokens are arriving; streamBuffer is filling.
 * move-pending  — A move has been rolled but awaits player confirmation or follow-up.
 * error         — The last turn failed; an error message is visible in the feed.
 */
export type TurnPhase =
  | 'idle'
  | 'resolving'
  | 'waiting-for-ai'
  | 'streaming'
  | 'move-pending'
  | 'error'

/** A displayable item in the Skald chat feed. */
export interface SkaldMessage {
  id: string
  /**
   * player  — text the player typed or a move they triggered
   * skald   — AI-generated narration
   * system  — informational or error messages from the app
   * outcome — move resolution card (content = JSON MoveOutcomeData)
   * oracle  — oracle table result strip (content = JSON OracleStripData)
   */
  role: 'player' | 'skald' | 'system' | 'outcome' | 'oracle'
  content: string
  turnId?: string
  timestamp: string
}

/** Transient oracle panel state — holds selections before a roll is committed. */
export interface OracleDraft {
  tableId: string | null
  odds: Odds | null
}
