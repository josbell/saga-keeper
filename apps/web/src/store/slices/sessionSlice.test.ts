import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { createSessionSlice, type SessionSlice } from './sessionSlice'
import type { Campaign, NarrativeTurn, SessionEvent, PlayerAction } from '@saga-keeper/domain'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
  return createStore<SessionSlice>()(createSessionSlice)
}

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'The Iron Road',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['char-1'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeTurn(overrides: Partial<NarrativeTurn> = {}): NarrativeTurn {
  return {
    turnId: 'turn-1',
    input: { type: 'free', userText: 'I look around.' },
    narration: 'The forest is silent.',
    statDeltas: [],
    extractedEntities: [],
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeEvent(overrides: Partial<SessionEvent> = {}): SessionEvent {
  return {
    id: 'evt-1',
    campaignId: 'camp-1',
    turnId: 'turn-1',
    type: 'skald.narrated',
    playerId: 'player-1',
    payload: {},
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeAction(overrides: Partial<PlayerAction> = {}): PlayerAction {
  return { type: 'free', userText: 'I search the ruins.', ...overrides }
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('createSessionSlice — initial state', () => {
  it('campaign is null', () => {
    const store = makeStore()
    expect(store.getState().campaign).toBeNull()
  })

  it('activeTurnId is null', () => {
    const store = makeStore()
    expect(store.getState().activeTurnId).toBeNull()
  })

  it('turns is an empty array', () => {
    const store = makeStore()
    expect(store.getState().turns).toEqual([])
  })

  it('events is an empty array', () => {
    const store = makeStore()
    expect(store.getState().events).toEqual([])
  })

  it('pendingAction is null', () => {
    const store = makeStore()
    expect(store.getState().pendingAction).toBeNull()
  })
})

// ── setCampaign ───────────────────────────────────────────────────────────────

describe('createSessionSlice — setCampaign', () => {
  it('sets the campaign', () => {
    const store = makeStore()
    const campaign = makeCampaign()
    store.getState().setCampaign(campaign)
    expect(store.getState().campaign).toEqual(campaign)
  })

  it('does not wipe turns when called (not a session reset)', () => {
    const store = makeStore()
    store.getState().setCampaign(makeCampaign())
    store.getState().appendTurn(makeTurn())
    store.getState().setCampaign(makeCampaign({ name: 'Updated' }))
    expect(store.getState().turns).toHaveLength(1)
  })
})

// ── clearCampaign ─────────────────────────────────────────────────────────────

describe('createSessionSlice — clearCampaign', () => {
  it('sets campaign to null', () => {
    const store = makeStore()
    store.getState().setCampaign(makeCampaign())
    store.getState().clearCampaign()
    expect(store.getState().campaign).toBeNull()
  })
})

// ── setPendingAction ──────────────────────────────────────────────────────────

describe('createSessionSlice — setPendingAction', () => {
  it('sets a pending action', () => {
    const store = makeStore()
    const action = makeAction()
    store.getState().setPendingAction(action)
    expect(store.getState().pendingAction).toEqual(action)
  })

  it('can be cleared by passing null', () => {
    const store = makeStore()
    store.getState().setPendingAction(makeAction())
    store.getState().setPendingAction(null)
    expect(store.getState().pendingAction).toBeNull()
  })
})

// ── appendTurn ────────────────────────────────────────────────────────────────

describe('createSessionSlice — appendTurn', () => {
  it('appends a turn', () => {
    const store = makeStore()
    store.getState().appendTurn(makeTurn())
    expect(store.getState().turns).toHaveLength(1)
  })

  it('preserves insertion order across multiple appends', () => {
    const store = makeStore()
    store.getState().appendTurn(makeTurn({ turnId: 'first' }))
    store.getState().appendTurn(makeTurn({ turnId: 'second' }))
    expect(store.getState().turns[0]?.turnId).toBe('first')
    expect(store.getState().turns[1]?.turnId).toBe('second')
  })
})

// ── appendEvent ───────────────────────────────────────────────────────────────

describe('createSessionSlice — appendEvent', () => {
  it('appends a session event', () => {
    const store = makeStore()
    store.getState().appendEvent(makeEvent())
    expect(store.getState().events).toHaveLength(1)
  })

  it('preserves insertion order', () => {
    const store = makeStore()
    store.getState().appendEvent(makeEvent({ id: 'evt-1' }))
    store.getState().appendEvent(makeEvent({ id: 'evt-2' }))
    expect(store.getState().events[0]?.id).toBe('evt-1')
    expect(store.getState().events[1]?.id).toBe('evt-2')
  })
})

// ── setActiveTurnId ───────────────────────────────────────────────────────────

describe('createSessionSlice — setActiveTurnId', () => {
  it('sets activeTurnId', () => {
    const store = makeStore()
    store.getState().setActiveTurnId('turn-42')
    expect(store.getState().activeTurnId).toBe('turn-42')
  })

  it('can be cleared by passing null', () => {
    const store = makeStore()
    store.getState().setActiveTurnId('turn-42')
    store.getState().setActiveTurnId(null)
    expect(store.getState().activeTurnId).toBeNull()
  })
})

// ── clearSession ──────────────────────────────────────────────────────────────

describe('createSessionSlice — clearSession', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
    store.getState().setCampaign(makeCampaign())
    store.getState().appendTurn(makeTurn())
    store.getState().appendEvent(makeEvent())
    store.getState().setPendingAction(makeAction())
    store.getState().setActiveTurnId('turn-1')
  })

  it('resets turns to empty', () => {
    store.getState().clearSession()
    expect(store.getState().turns).toEqual([])
  })

  it('resets events to empty', () => {
    store.getState().clearSession()
    expect(store.getState().events).toEqual([])
  })

  it('resets pendingAction to null', () => {
    store.getState().clearSession()
    expect(store.getState().pendingAction).toBeNull()
  })

  it('resets activeTurnId to null', () => {
    store.getState().clearSession()
    expect(store.getState().activeTurnId).toBeNull()
  })

  it('does NOT clear campaign — clearSession is a mid-session reset, not a full teardown', () => {
    store.getState().clearSession()
    expect(store.getState().campaign).not.toBeNull()
    expect(store.getState().campaign?.id).toBe('camp-1')
  })
})
