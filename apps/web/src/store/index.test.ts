import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './index'
import type { TurnResult } from '@saga-keeper/domain'

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

// ── applyTurnResult ───────────────────────────────────────────────────────────

function makeTurnResult(overrides: Partial<TurnResult> = {}): TurnResult {
  return {
    turnId: 'turn-42',
    input: { type: 'free', userText: 'I rest by the fire.' },
    narration: '',
    statDeltas: [],
    extractedEntities: [],
    timestamp: '2026-01-01T00:00:00.000Z',
    sessionEvents: [
      {
        id: 'evt-1',
        campaignId: 'camp-1',
        turnId: 'turn-42',
        type: 'player.input',
        playerId: 'local',
        payload: {},
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    ],
    ...overrides,
  }
}

describe('useGameStore — applyTurnResult', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState())
    useGameStore.getState().setPhase('resolving')
  })

  it('resets phase to idle', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().phase).toBe('idle')
  })

  it('clears streamBuffer', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().streamBuffer).toBe('')
  })

  it('appends the turn to session turns', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().turns).toHaveLength(1)
    expect(useGameStore.getState().turns[0]?.turnId).toBe('turn-42')
  })

  it('appends all sessionEvents to session events', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().events).toHaveLength(1)
    expect(useGameStore.getState().events[0]?.id).toBe('evt-1')
  })

  it('clears pendingAction', () => {
    useGameStore.getState().setPendingAction({ type: 'free', userText: 'test' })
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().pendingAction).toBeNull()
  })

  it('sets activeTurnId to result.turnId', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult())
    expect(useGameStore.getState().activeTurnId).toBe('turn-42')
  })

  it('appends only the player message for a free turn with no narration (offline tier)', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult({ narration: '' }))
    const msgs = useGameStore.getState().messages
    expect(msgs).toHaveLength(1)
    expect(msgs[0]?.role).toBe('player')
    expect(msgs[0]?.content).toBe('I rest by the fire.')
  })

  it('appends a skald message when narration is present', () => {
    useGameStore.getState().applyTurnResult(makeTurnResult({ narration: 'The fire crackles.' }))
    const skaldMsgs = useGameStore.getState().messages.filter((m) => m.role === 'skald')
    expect(skaldMsgs).toHaveLength(1)
    expect(skaldMsgs[0]?.content).toBe('The fire crackles.')
  })

  it('appends an outcome message when move + outcome present', () => {
    useGameStore.getState().applyTurnResult(
      makeTurnResult({
        move: 'face-danger',
        roll: {
          actionDie: 4,
          challengeDice: [3, 5],
          modifier: 2,
          total: 6,
          result: 'weak-hit',
          match: false,
        },
        outcome: {
          result: 'weak-hit',
          match: false,
          consequences: [],
          narrativeHints: [],
        },
      }),
    )
    const outcomeMsgs = useGameStore.getState().messages.filter((m) => m.role === 'outcome')
    expect(outcomeMsgs).toHaveLength(1)
    const data = JSON.parse(outcomeMsgs[0]!.content)
    expect(data.moveId).toBe('face-danger')
    expect(data.result).toBe('weak-hit')
    expect(data.roll.total).toBe(6)
  })

  it('appends an oracle message per oracleResult', () => {
    useGameStore.getState().applyTurnResult(
      makeTurnResult({
        oracleResults: [
          { tableId: 'action', roll: 42, raw: 'Inspect', timestamp: '2026-01-01T00:00:00.000Z' },
        ],
      }),
    )
    const oracleMsgs = useGameStore.getState().messages.filter((m) => m.role === 'oracle')
    expect(oracleMsgs).toHaveLength(1)
    const data = JSON.parse(oracleMsgs[0]!.content)
    expect(data.tableId).toBe('action')
    expect(data.raw).toBe('Inspect')
  })

  it('applies stat deltas to character data and keeps isDirty false', () => {
    useGameStore.getState().setCharacter({
      id: 'char-1',
      campaignId: 'camp-1',
      name: 'Björn',
      rulesetId: 'ironsworn-v1',
      data: { health: 5, spirit: 3 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    useGameStore.getState().applyTurnResult(
      makeTurnResult({
        statDeltas: [{ stat: 'health', before: 5, after: 4 }],
      }),
    )
    const char = useGameStore.getState().character!
    expect((char.data as Record<string, number>).health).toBe(4)
    expect(useGameStore.getState().isDirty).toBe(false)
  })

  it('does not modify character when statDeltas is empty', () => {
    useGameStore.getState().setCharacter({
      id: 'char-1',
      campaignId: 'camp-1',
      name: 'Björn',
      rulesetId: 'ironsworn-v1',
      data: { health: 5 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const before = useGameStore.getState().character
    useGameStore.getState().applyTurnResult(makeTurnResult({ statDeltas: [] }))
    expect(useGameStore.getState().character).toBe(before)
  })
})
