import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './index'

// ── helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState())
})

// ── slice composition ─────────────────────────────────────────────────────────

describe('useGameStore — all slices compose correctly', () => {
  it('has characterSlice initial state', () => {
    expect(useGameStore.getState().character).toBeNull()
    expect(useGameStore.getState().isDirty).toBe(false)
  })

  it('has skaldFeedSlice initial state', () => {
    expect(useGameStore.getState().messages).toEqual([])
    expect(useGameStore.getState().phase).toBe('idle')
    expect(useGameStore.getState().streamBuffer).toBe('')
  })

  it('has oracleSlice initial state', () => {
    expect(useGameStore.getState().history).toEqual([])
    expect(useGameStore.getState().lastResult).toBeNull()
  })

  it('has worldSlice initial state', () => {
    expect(useGameStore.getState().entities).toEqual([])
    expect(useGameStore.getState().filterType).toBe('all')
    expect(useGameStore.getState().selectedEntityId).toBeNull()
  })

  it('has sessionSlice initial state', () => {
    expect(useGameStore.getState().campaign).toBeNull()
    expect(useGameStore.getState().turns).toEqual([])
    expect(useGameStore.getState().events).toEqual([])
  })
})

// ── cross-slice isolation ─────────────────────────────────────────────────────

describe('useGameStore — cross-slice isolation', () => {
  it('clearSession does not affect character state', () => {
    useGameStore.getState().setCharacter({
      id: 'char-1',
      campaignId: 'camp-1',
      name: 'Björn',
      rulesetId: 'ironsworn-v1',
      data: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    useGameStore.getState().clearSession()
    expect(useGameStore.getState().character?.id).toBe('char-1')
  })

  it('clearFeed does not affect oracle history', () => {
    useGameStore.getState().recordOracleRoll({
      tableId: 'action',
      roll: 12,
      raw: 'Seek',
      timestamp: '2026-01-01T00:00:00.000Z',
    })
    useGameStore.getState().clearFeed()
    expect(useGameStore.getState().history).toHaveLength(1)
  })

  it('clearHistory does not affect session turns', () => {
    useGameStore.getState().appendTurn({
      turnId: 'turn-1',
      input: { type: 'free', userText: 'test' },
      narration: 'test',
      statDeltas: [],
      extractedEntities: [],
      timestamp: '2026-01-01T00:00:00.000Z',
    })
    useGameStore.getState().clearHistory()
    expect(useGameStore.getState().turns).toHaveLength(1)
  })
})
