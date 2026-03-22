import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { createWorldSlice, type WorldSlice } from './worldSlice'
import type { WorldEntity } from '@saga-keeper/domain'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
  return createStore<WorldSlice>()(createWorldSlice)
}

function makeEntity(overrides: Partial<WorldEntity> = {}): WorldEntity {
  return {
    id: 'entity-1',
    campaignId: 'camp-1',
    type: 'npc',
    name: 'Astrid',
    attributes: {},
    connections: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('createWorldSlice — initial state', () => {
  it('entities is an empty array', () => {
    const store = makeStore()
    expect(store.getState().entities).toEqual([])
  })

  it('filterType is "all"', () => {
    const store = makeStore()
    expect(store.getState().filterType).toBe('all')
  })

  it('selectedEntityId is null', () => {
    const store = makeStore()
    expect(store.getState().selectedEntityId).toBeNull()
  })
})

// ── setEntities ───────────────────────────────────────────────────────────────

describe('createWorldSlice — setEntities', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('replaces entity array', () => {
    const entities = [makeEntity({ id: 'a' }), makeEntity({ id: 'b' })]
    store.getState().setEntities(entities)
    expect(store.getState().entities).toHaveLength(2)
  })

  it('overwrites previous entities', () => {
    store.getState().setEntities([makeEntity({ id: 'old' })])
    store.getState().setEntities([makeEntity({ id: 'new' })])
    expect(store.getState().entities).toHaveLength(1)
    expect(store.getState().entities[0]?.id).toBe('new')
  })
})

// ── upsertEntity ──────────────────────────────────────────────────────────────

describe('createWorldSlice — upsertEntity', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('appends a new entity', () => {
    store.getState().upsertEntity(makeEntity())
    expect(store.getState().entities).toHaveLength(1)
  })

  it('replaces an entity with a matching id', () => {
    store.getState().upsertEntity(makeEntity({ name: 'original' }))
    store.getState().upsertEntity(makeEntity({ name: 'updated' }))
    expect(store.getState().entities).toHaveLength(1)
    expect(store.getState().entities[0]?.name).toBe('updated')
  })

  it('does not duplicate when upserting an existing id', () => {
    store.getState().upsertEntity(makeEntity({ id: 'x' }))
    store.getState().upsertEntity(makeEntity({ id: 'x' }))
    expect(store.getState().entities).toHaveLength(1)
  })

  it('preserves other entities when upserting', () => {
    store.getState().upsertEntity(makeEntity({ id: 'a' }))
    store.getState().upsertEntity(makeEntity({ id: 'b' }))
    store.getState().upsertEntity(makeEntity({ id: 'a', name: 'updated' }))
    expect(store.getState().entities).toHaveLength(2)
  })
})

// ── removeEntity ──────────────────────────────────────────────────────────────

describe('createWorldSlice — removeEntity', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().setEntities([makeEntity({ id: 'a' }), makeEntity({ id: 'b' })])
  })

  it('removes entity by id', () => {
    store.getState().removeEntity('a')
    expect(store.getState().entities).toHaveLength(1)
    expect(store.getState().entities[0]?.id).toBe('b')
  })

  it('is a no-op when id is not found', () => {
    store.getState().removeEntity('nonexistent')
    expect(store.getState().entities).toHaveLength(2)
  })

  it('clears selectedEntityId when the removed entity was selected', () => {
    store.getState().selectEntity('a')
    store.getState().removeEntity('a')
    expect(store.getState().selectedEntityId).toBeNull()
  })

  it('does not clear selectedEntityId when a different entity is removed', () => {
    store.getState().selectEntity('a')
    store.getState().removeEntity('b')
    expect(store.getState().selectedEntityId).toBe('a')
  })
})

// ── setFilterType ─────────────────────────────────────────────────────────────

describe('createWorldSlice — setFilterType', () => {
  it('sets filterType', () => {
    const store = makeStore()
    store.getState().setFilterType('npc')
    expect(store.getState().filterType).toBe('npc')
  })

  it('does not modify entities array', () => {
    const store = makeStore()
    store.getState().setEntities([makeEntity(), makeEntity({ id: 'loc-1', type: 'location' })])
    store.getState().setFilterType('npc')
    expect(store.getState().entities).toHaveLength(2)
  })
})

// ── selectEntity ──────────────────────────────────────────────────────────────

describe('createWorldSlice — selectEntity', () => {
  it('sets selectedEntityId', () => {
    const store = makeStore()
    store.getState().selectEntity('entity-1')
    expect(store.getState().selectedEntityId).toBe('entity-1')
  })

  it('can be cleared by passing null', () => {
    const store = makeStore()
    store.getState().selectEntity('entity-1')
    store.getState().selectEntity(null)
    expect(store.getState().selectedEntityId).toBeNull()
  })
})
