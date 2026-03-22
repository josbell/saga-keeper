/**
 * useGameStore — single Zustand store for all live game state.
 *
 * L3 services write into this store via useGameStore.getState().setX(...)
 * after each turn phase. UI components read from it via the useGameStore hook.
 *
 * No imports from @saga-keeper/ai-gateway or @saga-keeper/storage are allowed here.
 */
import { create } from 'zustand'
import { createCharacterSlice, type CharacterSlice } from './slices/characterSlice'
import { createSkaldFeedSlice, type SkaldFeedSlice } from './slices/skaldFeedSlice'
import { createOracleSlice, type OracleSlice } from './slices/oracleSlice'
import { createWorldSlice, type WorldSlice } from './slices/worldSlice'
import { createSessionSlice, type SessionSlice } from './slices/sessionSlice'

export type GameStore = CharacterSlice & SkaldFeedSlice & OracleSlice & WorldSlice & SessionSlice

export const useGameStore = create<GameStore>()((...a) => ({
  ...createCharacterSlice(...a),
  ...createSkaldFeedSlice(...a),
  ...createOracleSlice(...a),
  ...createWorldSlice(...a),
  ...createSessionSlice(...a),
}))

export type { TurnPhase, SkaldMessage, OracleDraft } from './types'
export type { CharacterSlice } from './slices/characterSlice'
export type { SkaldFeedSlice } from './slices/skaldFeedSlice'
export type { OracleSlice } from './slices/oracleSlice'
export type { WorldSlice } from './slices/worldSlice'
export type { SessionSlice } from './slices/sessionSlice'
