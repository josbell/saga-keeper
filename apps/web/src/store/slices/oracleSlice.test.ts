import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { createOracleSlice, type OracleSlice } from './oracleSlice'
import type { OracleRoll, FatesResult } from '@saga-keeper/domain'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
  return createStore<OracleSlice>()(createOracleSlice)
}

function makeRoll(overrides: Partial<OracleRoll> = {}): OracleRoll {
  return {
    tableId: 'action',
    roll: 42,
    raw: 'Betray',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeFates(overrides: Partial<FatesResult> = {}): FatesResult {
  return {
    odds: 'fifty-fifty',
    roll: 55,
    result: true,
    extreme: false,
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('createOracleSlice — initial state', () => {
  it('history is an empty array', () => {
    const store = makeStore()
    expect(store.getState().history).toEqual([])
  })

  it('fatesHistory is an empty array', () => {
    const store = makeStore()
    expect(store.getState().fatesHistory).toEqual([])
  })

  it('draft.tableId is null', () => {
    const store = makeStore()
    expect(store.getState().draft.tableId).toBeNull()
  })

  it('draft.odds is null', () => {
    const store = makeStore()
    expect(store.getState().draft.odds).toBeNull()
  })

  it('lastResult is null', () => {
    const store = makeStore()
    expect(store.getState().lastResult).toBeNull()
  })

  it('lastFates is null', () => {
    const store = makeStore()
    expect(store.getState().lastFates).toBeNull()
  })
})

// ── recordOracleRoll ──────────────────────────────────────────────────────────

describe('createOracleSlice — recordOracleRoll', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('adds roll to history', () => {
    store.getState().recordOracleRoll(makeRoll())
    expect(store.getState().history).toHaveLength(1)
  })

  it('sets lastResult', () => {
    const roll = makeRoll({ raw: 'Betray' })
    store.getState().recordOracleRoll(roll)
    expect(store.getState().lastResult).toEqual(roll)
  })

  it('newest roll is at index 0 (prepend order)', () => {
    const older = makeRoll({ raw: 'older', timestamp: '2026-01-01T00:00:00.000Z' })
    const newer = makeRoll({ raw: 'newer', timestamp: '2026-01-02T00:00:00.000Z' })
    store.getState().recordOracleRoll(older)
    store.getState().recordOracleRoll(newer)
    expect(store.getState().history[0]?.raw).toBe('newer')
  })
})

// ── recordFates ───────────────────────────────────────────────────────────────

describe('createOracleSlice — recordFates', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('adds result to fatesHistory', () => {
    store.getState().recordFates(makeFates())
    expect(store.getState().fatesHistory).toHaveLength(1)
  })

  it('sets lastFates', () => {
    const result = makeFates({ result: false })
    store.getState().recordFates(result)
    expect(store.getState().lastFates).toEqual(result)
  })

  it('newest result is at index 0 (prepend order)', () => {
    store.getState().recordFates(makeFates({ roll: 10 }))
    store.getState().recordFates(makeFates({ roll: 99 }))
    expect(store.getState().fatesHistory[0]?.roll).toBe(99)
  })
})

// ── setDraft ──────────────────────────────────────────────────────────────────

describe('createOracleSlice — setDraft', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('sets tableId', () => {
    store.getState().setDraft({ tableId: 'action' })
    expect(store.getState().draft.tableId).toBe('action')
  })

  it('sets odds', () => {
    store.getState().setDraft({ odds: 'likely' })
    expect(store.getState().draft.odds).toBe('likely')
  })

  it('partial update does not wipe unrelated draft fields', () => {
    store.getState().setDraft({ tableId: 'theme' })
    store.getState().setDraft({ odds: 'unlikely' })
    expect(store.getState().draft.tableId).toBe('theme')
    expect(store.getState().draft.odds).toBe('unlikely')
  })
})

// ── clearDraft ────────────────────────────────────────────────────────────────

describe('createOracleSlice — clearDraft', () => {
  it('resets tableId to null', () => {
    const store = makeStore()
    store.getState().setDraft({ tableId: 'action' })
    store.getState().clearDraft()
    expect(store.getState().draft.tableId).toBeNull()
  })

  it('resets odds to null', () => {
    const store = makeStore()
    store.getState().setDraft({ odds: 'likely' })
    store.getState().clearDraft()
    expect(store.getState().draft.odds).toBeNull()
  })
})

// ── clearHistory ──────────────────────────────────────────────────────────────

describe('createOracleSlice — clearHistory', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().recordOracleRoll(makeRoll())
    store.getState().recordFates(makeFates())
  })

  it('empties history', () => {
    store.getState().clearHistory()
    expect(store.getState().history).toEqual([])
  })

  it('empties fatesHistory', () => {
    store.getState().clearHistory()
    expect(store.getState().fatesHistory).toEqual([])
  })

  it('sets lastResult to null', () => {
    store.getState().clearHistory()
    expect(store.getState().lastResult).toBeNull()
  })

  it('sets lastFates to null', () => {
    store.getState().clearHistory()
    expect(store.getState().lastFates).toBeNull()
  })
})
