import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NarrativeDomain } from './NarrativeDomain'
import { OracleService } from '../oracle/OracleService'
import { DiceService } from '../dice/DiceService'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type {
  StorageAdapter,
  AIGateway,
  Campaign,
  CharacterState,
  WorldEntity,
  SessionEvent,
  CompletionResponse,
} from '@saga-keeper/domain'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CHARACTER: CharacterState = {
  id: 'char-1',
  campaignId: 'camp-1',
  name: 'Aldric',
  rulesetId: 'ironsworn-v1',
  data: {
    edge: 2, heart: 3, iron: 1, shadow: 2, wits: 1,
    health: 5, spirit: 5, supply: 5, momentum: 2,
    debilities: {
      wounded: false, shaken: false, unprepared: false, encumbered: false,
      maimed: false, corrupted: false, cursed: false, tormented: false, weak: false,
    },
    vows: [], bonds: [], assetIds: [],
    experience: { earned: 0, spent: 0 },
    tracks: { combat: 0, journey: 0, bonds: 0 },
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const CAMPAIGN: Campaign = {
  id: 'camp-1',
  name: 'Test Campaign',
  rulesetId: 'ironsworn-v1',
  status: 'active',
  mode: 'solo',
  characterIds: ['char-1'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

// DiceRoll stubs for controlled outcomes
function makeRoll(total: number, c0: number, c1: number) {
  return {
    request: { action: 'd6' as const, challenge: ['d10', 'd10'] as ['d10', 'd10'], modifier: 0, seed: 'test' },
    actionDie: total,
    challengeDice: [c0, c1] as [number, number],
    modifier: 0,
    total,
    seed: 'test',
    rolledAt: '2026-01-01T00:00:00Z',
  }
}

// total=11 beats c0=1 and c1=5 → strong-hit on face-danger (+1 momentum)
const STRONG_HIT_ROLL = makeRoll(11, 1, 5)
// total=6 beats c0=1 but not c1=8 → weak-hit on face-danger (no deltas)
const WEAK_HIT_ROLL = makeRoll(6, 1, 8)
// total=2 beats neither c0=5 nor c1=8 → miss on face-danger (oracle triggered)
const MISS_ROLL = makeRoll(2, 5, 8)

const AI_NARRATION = 'The iron wind howls around you.'
const AI_RESPONSE: CompletionResponse = { text: AI_NARRATION, intent: 'skald.move', tokensUsed: 42 }

// ── Helpers ───────────────────────────────────────────────────────────────────

function appendedTypes(mockStorage: { session: { appendBatch: ReturnType<typeof vi.fn> } }): string[] {
  const calls = mockStorage.session.appendBatch.mock.calls as unknown[][]
  if (calls.length === 0) return []
  if (calls.length !== 1) {
    throw new Error(
      `Expected session.appendBatch to be called exactly once, but was called ${calls.length} times.`
    )
  }
  // appendBatch is called once with (campaignId, events[])
  return ((calls[0]![1] as SessionEvent[]) ?? []).map((e) => e.type)
}

function makeStorage(overrides?: Partial<{
  recentEvents: SessionEvent[]
  worldEntities: WorldEntity[]
}>) {
  const storage = {
    campaigns: { get: vi.fn().mockResolvedValue(CAMPAIGN), list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    characters: { get: vi.fn().mockResolvedValue(CHARACTER), save: vi.fn().mockImplementation(async (c: CharacterState) => c) },
    session: {
      append: vi.fn().mockResolvedValue(undefined),
      appendBatch: vi.fn().mockResolvedValue(undefined),
      getRecent: vi.fn().mockResolvedValue(overrides?.recentEvents ?? []),
      getAll: vi.fn().mockResolvedValue([]),
    },
    world: {
      list: vi.fn().mockResolvedValue(overrides?.worldEntities ?? []),
      get: vi.fn(), save: vi.fn(), delete: vi.fn(),
    },
    export: vi.fn(),
    import: vi.fn(),
    type: 'local' as const,
    supportsRealtime: false,
    requiresAuth: false,
  } as unknown as StorageAdapter & { session: { append: ReturnType<typeof vi.fn>; appendBatch: ReturnType<typeof vi.fn> }; characters: { save: ReturnType<typeof vi.fn> } }
  return storage
}

function makeAi(responseOverride?: Partial<CompletionResponse>): AIGateway & { complete: ReturnType<typeof vi.fn> } {
  return {
    complete: vi.fn().mockResolvedValue({ ...AI_RESPONSE, ...responseOverride }),
    stream: vi.fn(),
    getCapabilities: vi.fn().mockReturnValue({ streaming: false, maxContextTokens: 8000, supportsSystemPrompt: true, localOnly: false }),
    getTier: vi.fn().mockReturnValue('full-skald'),
  } as unknown as AIGateway & { complete: ReturnType<typeof vi.fn> }
}

// ── Move turns ────────────────────────────────────────────────────────────────

describe('NarrativeDomain.processTurn — move (strong-hit)', () => {
  let storage: ReturnType<typeof makeStorage>
  let ai: ReturnType<typeof makeAi>
  let domain: NarrativeDomain
  let mockDice: typeof DiceService

  beforeEach(() => {
    storage = makeStorage()
    ai = makeAi()
    mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), mockDice)
  })

  it('returns a NarrativeTurn with the required shape', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.turnId).toBeTypeOf('string')
    expect(turn.input).toEqual({ type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.move).toBe('face-danger')
    expect(turn.narration).toBeTypeOf('string')
    expect(Array.isArray(turn.statDeltas)).toBe(true)
    expect(Array.isArray(turn.extractedEntities)).toBe(true)
    expect(turn.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('populates roll with actionDie, challengeDice, modifier, total, result, match', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.roll).toBeDefined()
    expect(turn.roll!.actionDie).toBe(STRONG_HIT_ROLL.actionDie)
    expect(turn.roll!.challengeDice).toEqual(STRONG_HIT_ROLL.challengeDice)
    expect(turn.roll!.result).toBe('strong-hit')
    expect(typeof turn.roll!.match).toBe('boolean')
  })

  it('narration comes from AI response text', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.narration).toBe(AI_NARRATION)
  })

  it('statDeltas reflects move consequences (momentum +1 on strong-hit face-danger)', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.statDeltas).toEqual([{ stat: 'momentum', before: 2, after: 3 }])
  })

  it('calls characters.save when stat deltas exist', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(storage.characters.save).toHaveBeenCalledOnce()
    const saved = (storage.characters.save.mock.calls[0] as unknown[])[0] as CharacterState
    expect((saved.data as Record<string, number>)['momentum']).toBe(3)
  })

  it('does NOT append oracle.consulted on a strong-hit', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).not.toContain('oracle.consulted')
  })

  it('appends player.input event', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('player.input')
  })

  it('appends dice.rolled event', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('dice.rolled')
  })

  it('appends move.resolved event', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('move.resolved')
  })

  it('appends skald.narrated event', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('skald.narrated')
  })

  it('appends character.mutated event when stat deltas exist', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('character.mutated')
  })

  it('player.input is the first event appended', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)[0]).toBe('player.input')
  })
})

describe('NarrativeDomain.processTurn — move (weak-hit, no deltas)', () => {
  let storage: ReturnType<typeof makeStorage>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    const mockDice = { roll: vi.fn().mockReturnValue(WEAK_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), mockDice)
  })

  it('does NOT call characters.save when outcome has no consequences', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(storage.characters.save).not.toHaveBeenCalled()
  })

  it('does NOT append character.mutated when no stat deltas', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).not.toContain('character.mutated')
  })

  it('statDeltas is empty', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.statDeltas).toEqual([])
  })
})

describe('NarrativeDomain.processTurn — move (miss, oracle triggered)', () => {
  let storage: ReturnType<typeof makeStorage>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    const mockDice = { roll: vi.fn().mockReturnValue(MISS_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), mockDice)
  })

  it('appends oracle.consulted event on a miss', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('oracle.consulted')
  })

  it('oracleResults is populated on a miss with exactly one auto-triggered roll', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.oracleResults).toBeDefined()
    expect(turn.oracleResults).toHaveLength(1)
    expect(turn.oracleResults![0]!.tableId).toBe('pay-the-price')
  })
})

describe('NarrativeDomain.processTurn — entity extraction', () => {
  let storage: ReturnType<typeof makeStorage>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(
      storage,
      ironswornPlugin,
      makeAi({ text: 'You meet [[Aldric]] and [[The Iron Hold]] on the path.' }),
      new OracleService(),
      mockDice,
    )
  })

  it('extracts [[EntityName]] patterns from AI response', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.extractedEntities).toEqual(['Aldric', 'The Iron Hold'])
  })

  it('appends entity.extracted event when entities are found', async () => {
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(appendedTypes(storage)).toContain('entity.extracted')
  })
})

describe('NarrativeDomain.processTurn — no entities in response', () => {
  it('extractedEntities is empty when AI response has no [[ ]] patterns', async () => {
    const storage = makeStorage()
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    const domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), mockDice)
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(turn.extractedEntities).toEqual([])
    expect(appendedTypes(storage)).not.toContain('entity.extracted')
  })
})

describe('NarrativeDomain.processTurn — move validation', () => {
  let domain: NarrativeDomain

  beforeEach(() => {
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(makeStorage(), ironswornPlugin, makeAi(), new OracleService(), mockDice)
  })

  it('throws when moveId is missing', async () => {
    await expect(domain.processTurn('camp-1', { type: 'move' })).rejects.toThrow(/moveId/)
  })

  it('uses modifier 0 when statKey is absent', async () => {
    // Should not throw — modifier defaults to 0
    const turn = await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger' })
    expect(turn.roll!.modifier).toBe(0)
  })

  it('throws when moveId is not recognized by the plugin', async () => {
    await expect(
      domain.processTurn('camp-1', { type: 'move', moveId: 'nonexistent-move' })
    ).rejects.toThrow(/Unknown move/)
  })

  it('throws when campaign has no characters', async () => {
    const emptyCampaign = { ...CAMPAIGN, characterIds: [] }
    const storage = makeStorage()
    ;(storage.campaigns.get as ReturnType<typeof vi.fn>).mockResolvedValue(emptyCampaign)
    const emptyDomain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), DiceService)
    await expect(
      emptyDomain.processTurn('camp-1', { type: 'free', userText: 'Hello.' })
    ).rejects.toThrow(/no characters/)
  })
})

// ── Oracle turns ──────────────────────────────────────────────────────────────

describe('NarrativeDomain.processTurn — oracle', () => {
  let storage: ReturnType<typeof makeStorage>
  let ai: ReturnType<typeof makeAi>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    ai = makeAi({ intent: 'oracle.narrate' })
    domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), DiceService)
  })

  it('returns a NarrativeTurn with oracleResults populated', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'oracle', odds: 'fifty-fifty' })
    expect(turn.oracleResults).toBeDefined()
    expect(turn.oracleResults!.length).toBeGreaterThan(0)
  })

  it('roll is undefined for oracle-type actions', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'oracle', odds: 'fifty-fifty' })
    expect(turn.roll).toBeUndefined()
  })

  it('statDeltas is empty for oracle-type actions', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'oracle', odds: 'fifty-fifty' })
    expect(turn.statDeltas).toEqual([])
  })

  it('AI is called with oracle.narrate intent', async () => {
    await domain.processTurn('camp-1', { type: 'oracle', odds: 'fifty-fifty' })
    expect(ai.complete.mock.calls[0]![0].intent).toBe('oracle.narrate')
  })

  it('event sequence is player.input → oracle.consulted → skald.narrated', async () => {
    await domain.processTurn('camp-1', { type: 'oracle', odds: 'fifty-fifty' })
    const types = appendedTypes(storage)
    expect(types[0]).toBe('player.input')
    expect(types[1]).toBe('oracle.consulted')
    expect(types[2]).toBe('skald.narrated')
    expect(types).toHaveLength(3)
  })

  it('oracle result uses ask-the-fates tableId', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'oracle', odds: 'likely' })
    expect(turn.oracleResults![0]!.tableId).toBe('ask-the-fates')
  })
})

// ── Free turns ────────────────────────────────────────────────────────────────

describe('NarrativeDomain.processTurn — free', () => {
  let storage: ReturnType<typeof makeStorage>
  let ai: ReturnType<typeof makeAi>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    ai = makeAi({ intent: 'skald.narrate' })
    domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), DiceService)
  })

  it('returns a NarrativeTurn with no roll', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'free', userText: 'I look around.' })
    expect(turn.roll).toBeUndefined()
  })

  it('statDeltas is empty', async () => {
    const turn = await domain.processTurn('camp-1', { type: 'free', userText: 'I look around.' })
    expect(turn.statDeltas).toEqual([])
  })

  it('AI is called with skald.narrate intent', async () => {
    await domain.processTurn('camp-1', { type: 'free', userText: 'I look around.' })
    expect(ai.complete.mock.calls[0]![0].intent).toBe('skald.narrate')
  })

  it('appends exactly 2 events: player.input and skald.narrated', async () => {
    await domain.processTurn('camp-1', { type: 'free', userText: 'I look around.' })
    expect(appendedTypes(storage)).toEqual(['player.input', 'skald.narrated'])
  })
})

// ── Character selection (#19) ─────────────────────────────────────────────────

const CHARACTER_2: CharacterState = {
  id: 'char-2',
  campaignId: 'camp-1',
  name: 'Mira',
  rulesetId: 'ironsworn-v1',
  data: {
    edge: 1, heart: 2, iron: 3, shadow: 1, wits: 2,
    health: 5, spirit: 5, supply: 5, momentum: 2,
    debilities: {
      wounded: false, shaken: false, unprepared: false, encumbered: false,
      maimed: false, corrupted: false, cursed: false, tormented: false, weak: false,
    },
    vows: [], bonds: [], assetIds: [],
    experience: { earned: 0, spent: 0 },
    tracks: { combat: 0, journey: 0, bonds: 0 },
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const MULTI_CHAR_CAMPAIGN: Campaign = {
  ...CAMPAIGN,
  characterIds: ['char-1', 'char-2'],
}

describe('NarrativeDomain.processTurn — character selection', () => {
  it('uses action.characterId when provided', async () => {
    const storage = makeStorage()
    ;(storage.campaigns.get as ReturnType<typeof vi.fn>).mockResolvedValue(MULTI_CHAR_CAMPAIGN)
    ;(storage.characters.get as ReturnType<typeof vi.fn>).mockImplementation(async (id: string) =>
      id === 'char-2' ? CHARACTER_2 : CHARACTER,
    )
    const domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), DiceService)
    await domain.processTurn('camp-1', { type: 'free', userText: 'Hello.', characterId: 'char-2' })
    expect(storage.characters.get).toHaveBeenCalledWith('char-2')
  })

  it('falls back to characterIds[0] when action.characterId is omitted', async () => {
    const storage = makeStorage()
    ;(storage.campaigns.get as ReturnType<typeof vi.fn>).mockResolvedValue(MULTI_CHAR_CAMPAIGN)
    const domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), DiceService)
    await domain.processTurn('camp-1', { type: 'free', userText: 'Hello.' })
    expect(storage.characters.get).toHaveBeenCalledWith('char-1')
  })

  it('throws when action.characterId is not in campaign.characterIds', async () => {
    const storage = makeStorage()
    const domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), DiceService)
    await expect(
      domain.processTurn('camp-1', { type: 'free', userText: 'Hello.', characterId: 'unknown-char' }),
    ).rejects.toThrow(/does not belong to campaign/)
  })

  it('throws "does not belong" (not "no characters") when characterId is explicit but campaign is empty', async () => {
    const storage = makeStorage()
    ;(storage.campaigns.get as ReturnType<typeof vi.fn>).mockResolvedValue({ ...CAMPAIGN, characterIds: [] })
    const domain = new NarrativeDomain(storage, ironswornPlugin, makeAi(), new OracleService(), DiceService)
    await expect(
      domain.processTurn('camp-1', { type: 'free', userText: 'Hello.', characterId: 'explicit-char' }),
    ).rejects.toThrow(/does not belong to campaign/)
  })
})

// ── GameContext assembly ──────────────────────────────────────────────────────

describe('NarrativeDomain — GameContext assembly', () => {
  it('character snapshot summary contains key stats', async () => {
    const storage = makeStorage()
    const ai = makeAi()
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    const domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), mockDice)
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    const ctx = ai.complete.mock.calls[0]![0].context
    const summary: string = ctx.characters[0].summary
    expect(summary).toMatch(/Edge:2/)
    expect(summary).toMatch(/Heart:3/)
  })

  it('GameContext.recentEvents matches what storage returned', async () => {
    const fakeEvents: SessionEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `evt-${i}`, campaignId: 'camp-1', turnId: 'turn-1',
      type: 'player.input' as const, playerId: 'local', payload: {}, timestamp: new Date().toISOString(),
    }))
    const storage = makeStorage({ recentEvents: fakeEvents })
    const ai = makeAi()
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    const domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), mockDice)
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    expect(ai.complete.mock.calls[0]![0].context.recentEvents).toHaveLength(5)
  })

  it('world.totalEntityCount reflects world list length', async () => {
    const fakeEntities: WorldEntity[] = [
      { id: 'e1', campaignId: 'camp-1', type: 'npc', name: 'Kira', attributes: {}, connections: [], createdAt: '', updatedAt: '' },
      { id: 'e2', campaignId: 'camp-1', type: 'location', name: 'The Hold', attributes: {}, connections: [], createdAt: '', updatedAt: '' },
    ]
    const storage = makeStorage({ worldEntities: fakeEntities })
    const ai = makeAi()
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    const domain = new NarrativeDomain(storage, ironswornPlugin, ai, new OracleService(), mockDice)
    await domain.processTurn('camp-1', { type: 'move', moveId: 'face-danger', statKey: 'edge' })
    const ctx = ai.complete.mock.calls[0]![0].context
    expect(ctx.world.totalEntityCount).toBe(2)
    expect(ctx.world.entities).toHaveLength(2)
  })
})
