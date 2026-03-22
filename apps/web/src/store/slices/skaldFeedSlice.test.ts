import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { createSkaldFeedSlice, type SkaldFeedSlice } from './skaldFeedSlice'
import type { SkaldMessage, TurnPhase } from '../types'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
  return createStore<SkaldFeedSlice>()(createSkaldFeedSlice)
}

function makeMessage(overrides: Partial<SkaldMessage> = {}): SkaldMessage {
  return {
    id: 'msg-1',
    role: 'player',
    content: 'I strike the wolf.',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — initial state', () => {
  it('messages is an empty array', () => {
    const store = makeStore()
    expect(store.getState().messages).toEqual([])
  })

  it('phase is idle', () => {
    const store = makeStore()
    expect(store.getState().phase).toBe('idle')
  })

  it('streamBuffer is an empty string', () => {
    const store = makeStore()
    expect(store.getState().streamBuffer).toBe('')
  })
})

// ── appendMessage ─────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — appendMessage', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('appends message to the feed', () => {
    const msg = makeMessage()
    store.getState().appendMessage(msg)
    expect(store.getState().messages).toHaveLength(1)
    expect(store.getState().messages[0]).toEqual(msg)
  })

  it('preserves insertion order across multiple appends', () => {
    const a = makeMessage({ id: 'a', content: 'first' })
    const b = makeMessage({ id: 'b', content: 'second' })
    store.getState().appendMessage(a)
    store.getState().appendMessage(b)
    expect(store.getState().messages[0]?.id).toBe('a')
    expect(store.getState().messages[1]?.id).toBe('b')
  })
})

// ── setPhase ──────────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — setPhase', () => {
  const phases: TurnPhase[] = ['idle', 'waiting-for-ai', 'streaming', 'move-pending', 'error']

  it.each(phases)('accepts phase "%s"', (phase) => {
    const store = makeStore()
    store.getState().setPhase(phase)
    expect(store.getState().phase).toBe(phase)
  })
})

// ── appendToStream ────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — appendToStream', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('accumulates chunks in streamBuffer', () => {
    store.getState().appendToStream('The ')
    store.getState().appendToStream('wolf ')
    store.getState().appendToStream('snarls.')
    expect(store.getState().streamBuffer).toBe('The wolf snarls.')
  })

  it('does not add anything to messages while streaming', () => {
    store.getState().appendToStream('partial chunk')
    expect(store.getState().messages).toHaveLength(0)
  })
})

// ── flushStream ───────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — flushStream', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().appendToStream('The wolf snarls.')
  })

  it('appends a skald message with the buffered content', () => {
    store.getState().flushStream('turn-1')
    expect(store.getState().messages).toHaveLength(1)
    expect(store.getState().messages[0]?.content).toBe('The wolf snarls.')
  })

  it('flushed message has role skald', () => {
    store.getState().flushStream('turn-1')
    expect(store.getState().messages[0]?.role).toBe('skald')
  })

  it('flushed message carries the provided turnId', () => {
    store.getState().flushStream('turn-99')
    expect(store.getState().messages[0]?.turnId).toBe('turn-99')
  })

  it('resets streamBuffer to empty string', () => {
    store.getState().flushStream('turn-1')
    expect(store.getState().streamBuffer).toBe('')
  })

  it('is a no-op when streamBuffer is empty — no empty message appended', () => {
    const emptyStore = makeStore()
    emptyStore.getState().flushStream('turn-1')
    expect(emptyStore.getState().messages).toHaveLength(0)
  })
})

// ── clearFeed ─────────────────────────────────────────────────────────────────

describe('createSkaldFeedSlice — clearFeed', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().appendMessage(makeMessage())
    store.getState().setPhase('streaming')
    store.getState().appendToStream('partial')
  })

  it('empties messages', () => {
    store.getState().clearFeed()
    expect(store.getState().messages).toEqual([])
  })

  it('resets phase to idle', () => {
    store.getState().clearFeed()
    expect(store.getState().phase).toBe('idle')
  })

  it('resets streamBuffer', () => {
    store.getState().clearFeed()
    expect(store.getState().streamBuffer).toBe('')
  })
})
