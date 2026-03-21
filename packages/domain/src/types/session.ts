// ── Session / narrative event types ──────────────────────────────────────────
// The session log is append-only. Events are never edited — only appended.

export type SessionEventType =
  | 'player.input'
  | 'move.resolved'
  | 'dice.rolled'
  | 'oracle.consulted'
  | 'skald.narrated'
  | 'entity.extracted'
  | 'character.mutated'
  | 'vow.updated'
  | 'session.started'
  | 'session.ended'

export interface SessionEvent {
  id: string
  campaignId: string
  turnId: string
  type: SessionEventType
  playerId: string
  characterId?: string
  payload: Record<string, unknown>
  timestamp: string
}

/** One complete Skald turn — composite of related SessionEvents */
export interface NarrativeTurn {
  turnId: string
  input: PlayerAction
  move?: string
  roll?: DiceRollRecord
  oracleResults?: OracleResultRecord[]
  narration: string
  statDeltas: import('./character').StatDelta[]
  extractedEntities: string[]
  timestamp: string
}

export interface PlayerAction {
  type: 'move' | 'free' | 'oracle'
  moveId?: string
  statKey?: string
  userText?: string
  odds?: import('./oracle').Odds
  /** Which character is acting. Defaults to campaign.characterIds[0] for solo play. */
  characterId?: string
}

export interface DiceRollRecord {
  actionDie: number
  challengeDice: [number, number]
  modifier: number
  total: number
  result: 'strong-hit' | 'weak-hit' | 'miss'
  match: boolean
}

export interface OracleResultRecord {
  tableId: string
  roll: number
  raw: string
  timestamp: string
  /** Raw PRNG output that produced this roll — enables deterministic replay */
  seed?: string
}
