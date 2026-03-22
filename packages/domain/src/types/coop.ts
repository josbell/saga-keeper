// ── Co-op session types ───────────────────────────────────────────────────────

import type { SessionEvent } from './session'
import type { CharacterState } from './character'
import type { WorldEntity, WorldPatch } from './world'

export type CoopMode = 'same-pc' | 'remote'

export interface PresenceState {
  playerId: string
  characterId: string
  status: 'online' | 'away' | 'typing'
  lastSeenAt: string
}

export interface TurnLockState {
  locked: boolean
  confirmedBy: string[]
  requiredPlayers: string[]
}

export interface CharacterPatch {
  characterId: string
  patch: Partial<CharacterState>
  timestamp: string
}

export type RealtimeEvent =
  | { type: 'session.event'; payload: SessionEvent }
  | { type: 'character.patch'; payload: CharacterPatch; owner: string }
  | { type: 'world.patch'; payload: WorldPatch }
  | { type: 'presence.update'; payload: PresenceState }
  | { type: 'turn.lock'; payload: TurnLockState }
  | { type: 'turn.unlock'; payload: { actingPlayer: string } }

export interface CoopSession {
  campaignId: string
  mode: CoopMode
  shareCode?: string
  players: PresenceState[]
  turnLock: TurnLockState
}
