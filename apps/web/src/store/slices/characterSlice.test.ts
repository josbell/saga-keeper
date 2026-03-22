import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { createCharacterSlice, type CharacterSlice } from './characterSlice'
import type { CharacterState } from '@saga-keeper/domain'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
  return createStore<CharacterSlice>()(createCharacterSlice)
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'char-1',
    campaignId: 'camp-1',
    name: 'Björn',
    rulesetId: 'ironsworn-v1',
    data: { edge: 2, heart: 3, iron: 1, shadow: 2, wits: 2 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('createCharacterSlice — initial state', () => {
  it('character is null', () => {
    const store = makeStore()
    expect(store.getState().character).toBeNull()
  })

  it('isDirty is false', () => {
    const store = makeStore()
    expect(store.getState().isDirty).toBe(false)
  })
})

// ── setCharacter ──────────────────────────────────────────────────────────────

describe('createCharacterSlice — setCharacter', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('replaces character', () => {
    const char = makeCharacter()
    store.getState().setCharacter(char)
    expect(store.getState().character).toEqual(char)
  })

  it('resets isDirty to false when a dirty store receives a fresh character', () => {
    const char = makeCharacter()
    store.getState().setCharacter(char)
    store.getState().patchCharacterData({ edge: 99 })
    expect(store.getState().isDirty).toBe(true)

    store.getState().setCharacter(makeCharacter())
    expect(store.getState().isDirty).toBe(false)
  })
})

// ── patchCharacterData ────────────────────────────────────────────────────────

describe('createCharacterSlice — patchCharacterData', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().setCharacter(makeCharacter())
  })

  it('merges patch into character.data', () => {
    store.getState().patchCharacterData({ edge: 3 })
    expect(store.getState().character?.data['edge']).toBe(3)
  })

  it('does not remove unpatched keys from data', () => {
    store.getState().patchCharacterData({ edge: 3 })
    expect(store.getState().character?.data['heart']).toBe(3)
  })

  it('sets isDirty to true', () => {
    store.getState().patchCharacterData({ edge: 3 })
    expect(store.getState().isDirty).toBe(true)
  })

  it('updates updatedAt to a new timestamp', () => {
    const before = store.getState().character?.updatedAt
    store.getState().patchCharacterData({ edge: 3 })
    expect(store.getState().character?.updatedAt).not.toBe(before)
  })

  it('does not mutate top-level character fields (id stays unchanged)', () => {
    store.getState().patchCharacterData({ id: 'injected' })
    expect(store.getState().character?.id).toBe('char-1')
  })

  it('is a no-op when character is null', () => {
    const emptyStore = makeStore()
    emptyStore.getState().patchCharacterData({ edge: 3 })
    expect(emptyStore.getState().character).toBeNull()
    expect(emptyStore.getState().isDirty).toBe(false)
  })
})

// ── clearCharacter ────────────────────────────────────────────────────────────

describe('createCharacterSlice — clearCharacter', () => {
  it('sets character to null', () => {
    const store = makeStore()
    store.getState().setCharacter(makeCharacter())
    store.getState().clearCharacter()
    expect(store.getState().character).toBeNull()
  })

  it('sets isDirty to false', () => {
    const store = makeStore()
    store.getState().setCharacter(makeCharacter())
    store.getState().patchCharacterData({ edge: 99 })
    store.getState().clearCharacter()
    expect(store.getState().isDirty).toBe(false)
  })
})

// ── markClean ─────────────────────────────────────────────────────────────────

describe('createCharacterSlice — markClean', () => {
  it('sets isDirty to false', () => {
    const store = makeStore()
    store.getState().setCharacter(makeCharacter())
    store.getState().patchCharacterData({ edge: 99 })
    expect(store.getState().isDirty).toBe(true)

    store.getState().markClean()
    expect(store.getState().isDirty).toBe(false)
  })

  it('does not clear the character', () => {
    const store = makeStore()
    const char = makeCharacter()
    store.getState().setCharacter(char)
    store.getState().markClean()
    expect(store.getState().character?.id).toBe('char-1')
  })
})
