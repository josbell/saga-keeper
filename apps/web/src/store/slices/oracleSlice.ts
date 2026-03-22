import type { StateCreator } from 'zustand'
import type { OracleRoll, FatesResult } from '@saga-keeper/domain'
import type { OracleDraft } from '../types'

export interface OracleSlice {
  /** Oracle table roll history — newest first. */
  history: OracleRoll[]
  /** Ask the Fates history — newest first. */
  fatesHistory: FatesResult[]
  /** Transient oracle panel state before a roll is committed. */
  draft: OracleDraft
  lastResult: OracleRoll | null
  lastFates: FatesResult | null
  recordOracleRoll: (roll: OracleRoll) => void
  recordFates: (result: FatesResult) => void
  setDraft: (partial: Partial<OracleDraft>) => void
  clearDraft: () => void
  clearHistory: () => void
}

export const createOracleSlice: StateCreator<OracleSlice> = (set) => ({
  history: [],
  fatesHistory: [],
  draft: { tableId: null, odds: null },
  lastResult: null,
  lastFates: null,

  recordOracleRoll: (roll) =>
    set((state) => ({ history: [roll, ...state.history], lastResult: roll })),

  recordFates: (result) =>
    set((state) => ({ fatesHistory: [result, ...state.fatesHistory], lastFates: result })),

  setDraft: (partial) => set((state) => ({ draft: { ...state.draft, ...partial } })),

  clearDraft: () => set({ draft: { tableId: null, odds: null } }),

  clearHistory: () => set({ history: [], fatesHistory: [], lastResult: null, lastFates: null }),
})
