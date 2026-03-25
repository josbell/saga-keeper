/**
 * useGameStore — single Zustand store for all live game state.
 *
 * L1 hooks call NarrativeDomain.processTurn() and commit the returned TurnResult via
 * applyTurnResult(). L3 has no knowledge that this store exists.
 *
 * No imports from @saga-keeper/ai-gateway or @saga-keeper/storage are allowed here.
 */
import { create } from 'zustand'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { TurnResult, NarrativeTurn } from '@saga-keeper/domain'
import { createCharacterSlice, type CharacterSlice } from './slices/characterSlice'
import { createSkaldFeedSlice, type SkaldFeedSlice } from './slices/skaldFeedSlice'
import { createOracleSlice, type OracleSlice } from './slices/oracleSlice'
import { createWorldSlice, type WorldSlice } from './slices/worldSlice'
import { createSessionSlice, type SessionSlice } from './slices/sessionSlice'
import type { SkaldMessage, TurnPhase } from './types'

export type GameStore = CharacterSlice &
  SkaldFeedSlice &
  OracleSlice &
  WorldSlice &
  SessionSlice & {
    /**
     * Atomically fans a completed TurnResult into the feed, session, and character slices.
     * Called exclusively by the useSkaldTurn L1 hook after processTurn() resolves.
     */
    applyTurnResult: (result: TurnResult) => void
  }

export const useGameStore = create<GameStore>()((set, get, store) => ({
  ...createCharacterSlice(set, get, store),
  ...createSkaldFeedSlice(set, get, store),
  ...createOracleSlice(set, get, store),
  ...createWorldSlice(set, get, store),
  ...createSessionSlice(set, get, store),

  applyTurnResult: (result: TurnResult) => {
    const ts = new Date().toISOString()
    const newMessages: SkaldMessage[] = []

    // Player bubble — always show what the player submitted
    if (result.input.userText) {
      newMessages.push({
        id: globalThis.crypto.randomUUID(),
        role: 'player',
        content: result.input.userText,
        turnId: result.turnId,
        timestamp: ts,
      })
    }

    // Outcome card — only when a move was resolved
    if (result.outcome && result.move) {
      const moveName =
        ironswornPlugin.moves.getAll().find((m) => m.id === result.move)?.name ?? result.move
      newMessages.push({
        id: globalThis.crypto.randomUUID(),
        role: 'outcome',
        content: JSON.stringify({
          moveId: result.move,
          moveName,
          result: result.roll?.result ?? null,
          match: result.roll?.match ?? false,
          roll: result.roll ?? null,
          consequences: result.outcome.consequences,
        }),
        turnId: result.turnId,
        timestamp: ts,
      })
    }

    // Oracle strip — one message per oracle result
    for (const or of result.oracleResults ?? []) {
      newMessages.push({
        id: globalThis.crypto.randomUUID(),
        role: 'oracle',
        content: JSON.stringify({ tableId: or.tableId, roll: or.roll, raw: or.raw }),
        turnId: result.turnId,
        timestamp: or.timestamp,
      })
    }

    // Skald narration — only when AI produced text (empty in offline tier)
    if (result.narration) {
      newMessages.push({
        id: globalThis.crypto.randomUUID(),
        role: 'skald',
        content: result.narration,
        turnId: result.turnId,
        timestamp: ts,
      })
    }

    // Character stat patch — service already persisted to storage, so isDirty stays false
    const state = get()
    let charPatch: Partial<Pick<GameStore, 'character' | 'isDirty'>> = {}
    if (state.character && result.statDeltas.length > 0) {
      const dataPatch: Record<string, unknown> = {}
      for (const d of result.statDeltas) {
        dataPatch[d.stat] = d.after
      }
      charPatch = {
        character: {
          ...state.character,
          data: { ...(state.character.data as Record<string, unknown>), ...dataPatch },
          updatedAt: ts,
        },
        isDirty: false,
      }
    }

    // TurnResult extends NarrativeTurn — cast is safe; sessionEvents is the only extra field
    const turn = result as NarrativeTurn

    set((s) => ({
      // Feed
      messages: [...s.messages, ...newMessages],
      phase: 'idle' as TurnPhase,
      streamBuffer: '',
      // Session
      turns: [...s.turns, turn],
      events: [...s.events, ...result.sessionEvents],
      pendingAction: null,
      activeTurnId: result.turnId,
      // Character (only spread when there are deltas)
      ...charPatch,
    }))
  },
}))

export type { TurnPhase, SkaldMessage, OracleDraft } from './types'
export type { CharacterSlice } from './slices/characterSlice'
export type { SkaldFeedSlice } from './slices/skaldFeedSlice'
export type { OracleSlice } from './slices/oracleSlice'
export type { WorldSlice } from './slices/worldSlice'
export type { SessionSlice } from './slices/sessionSlice'
