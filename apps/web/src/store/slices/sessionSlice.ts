import type { StateCreator } from 'zustand'
import type { Campaign, NarrativeTurn, SessionEvent, PlayerAction } from '@saga-keeper/domain'

export interface SessionSlice {
  campaign: Campaign | null
  activeTurnId: string | null
  turns: NarrativeTurn[]
  events: SessionEvent[]
  pendingAction: PlayerAction | null
  setCampaign: (campaign: Campaign) => void
  clearCampaign: () => void
  setPendingAction: (action: PlayerAction | null) => void
  appendTurn: (turn: NarrativeTurn) => void
  appendEvent: (event: SessionEvent) => void
  setActiveTurnId: (turnId: string | null) => void
  /** Resets in-session state (turns, events, pending action, activeTurnId).
   *  Does NOT clear campaign — use clearCampaign() for full teardown. */
  clearSession: () => void
}

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  campaign: null,
  activeTurnId: null,
  turns: [],
  events: [],
  pendingAction: null,

  setCampaign: (campaign) => set({ campaign }),

  clearCampaign: () => set({ campaign: null }),

  setPendingAction: (pendingAction) => set({ pendingAction }),

  appendTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),

  appendEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  setActiveTurnId: (activeTurnId) => set({ activeTurnId }),

  clearSession: () => set({ turns: [], events: [], pendingAction: null, activeTurnId: null }),
})
