import { randomUUID } from 'node:crypto'
import type { StateCreator } from 'zustand'
import type { SkaldMessage, TurnPhase } from '../types'

export interface SkaldFeedSlice {
  messages: SkaldMessage[]
  phase: TurnPhase
  streamBuffer: string
  appendMessage: (message: SkaldMessage) => void
  setPhase: (phase: TurnPhase) => void
  /** Accumulates a streaming token chunk into the buffer without touching messages. */
  appendToStream: (chunk: string) => void
  /** Converts the current buffer into a skald SkaldMessage and resets the buffer.
   *  No-op if the buffer is empty. */
  flushStream: (turnId: string) => void
  clearFeed: () => void
}

export const createSkaldFeedSlice: StateCreator<SkaldFeedSlice> = (set) => ({
  messages: [],
  phase: 'idle',
  streamBuffer: '',

  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setPhase: (phase) => set({ phase }),

  appendToStream: (chunk) => set((state) => ({ streamBuffer: state.streamBuffer + chunk })),

  flushStream: (turnId) =>
    set((state) => {
      if (state.streamBuffer === '') return state
      const message: SkaldMessage = {
        id: randomUUID(),
        role: 'skald',
        content: state.streamBuffer,
        turnId,
        timestamp: new Date().toISOString(),
      }
      return { messages: [...state.messages, message], streamBuffer: '' }
    }),

  clearFeed: () => set({ messages: [], phase: 'idle', streamBuffer: '' }),
})
