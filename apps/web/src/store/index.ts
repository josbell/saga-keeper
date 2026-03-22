/**
 * useGameStore — single Zustand store for all live game state.
 *
 * Slice types and creators are imported from ./slices/ and composed here.
 * L3 services write into this store via useGameStore.getState().setX(...)
 * after each turn phase. UI components read from it via the useGameStore hook.
 *
 * No imports from @saga-keeper/ai-gateway or @saga-keeper/storage allowed here.
 */

// Slices are added in subsequent commits — re-exported from here once wired.
export type { TurnPhase, SkaldMessage, OracleDraft } from './types'
