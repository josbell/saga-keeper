// Integration test — Skald turn loop (Issue #34)
// Wires the real AIGatewayImpl + ContextBuilder + IronswornPromptTemplate.
// Only the Anthropic HTTP call is replaced with a MockAdapter returning a fixed string.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NarrativeDomain } from './NarrativeDomain'
import { OracleService } from '../oracle/OracleService'
import { DiceService } from '../dice/DiceService'
import {
  AIGatewayImpl,
  ContextBuilder,
  IronswornPromptTemplate,
  TierGuard,
  InMemoryRateLimitStore,
  CostGuard,
  TemplateRegistry,
} from '@saga-keeper/ai-gateway'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type {
  StorageAdapter,
  ProviderAdapter,
  Campaign,
  CharacterState,
  SessionEvent,
  AITier,
} from '@saga-keeper/domain'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CHARACTER: CharacterState = {
  id: 'char-1',
  campaignId: 'camp-1',
  name: 'Aldric',
  rulesetId: 'ironsworn-v1',
  data: {
    edge: 2,
    heart: 3,
    iron: 1,
    shadow: 2,
    wits: 1,
    health: 5,
    spirit: 5,
    supply: 5,
    momentum: 2,
    debilities: {
      wounded: false,
      shaken: false,
      unprepared: false,
      encumbered: false,
      maimed: false,
      corrupted: false,
      cursed: false,
      tormented: false,
      weak: false,
    },
    vows: [],
    bonds: [],
    assetIds: [],
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

function makeRoll(total: number, c0: number, c1: number) {
  return {
    request: {
      action: 'd6' as const,
      challenge: ['d10', 'd10'] as ['d10', 'd10'],
      modifier: 0,
      seed: 'deadbeef',
    },
    actionDie: total,
    challengeDice: [c0, c1] as [number, number],
    modifier: 0,
    total,
    seed: 'deadbeef',
    rolledAt: '2026-01-01T00:00:00Z',
  }
}

// total=11 beats c0=1 and c1=5 → strong-hit on face-danger (+1 momentum)
const STRONG_HIT_ROLL = makeRoll(11, 1, 5)
// total=6 beats c0=1 but not c1=8 → weak-hit on face-danger (no deltas)
const WEAK_HIT_ROLL = makeRoll(6, 1, 8)
// total=2 beats neither c0=5 nor c1=8 → miss on face-danger (oracle triggered)
const MISS_ROLL = makeRoll(2, 5, 8)

const MOCK_NARRATION = 'The iron wind howls around you.'

// ── Factory functions ─────────────────────────────────────────────────────────

function makeMockAdapter(fixedText = MOCK_NARRATION): ProviderAdapter & { systemPrompts: string[] } {
  const systemPrompts: string[] = []
  return {
    id: 'mock',
    displayName: 'Mock Adapter',
    systemPrompts,
    complete: async (systemPrompt: string) => {
      systemPrompts.push(systemPrompt)
      return fixedText
    },
    stream: async function* () {},
    getCapabilities: () => ({
      streaming: false,
      maxContextTokens: 8000,
      supportsSystemPrompt: true,
      localOnly: false,
    }),
  }
}

function makeGateway(tier: AITier = 'full-skald', adapter: ProviderAdapter = makeMockAdapter()) {
  const template = new IronswornPromptTemplate()
  const registry = new TemplateRegistry([{ rulesetId: 'ironsworn-v1', template }])
  const contextBuilder = new ContextBuilder(template)
  return new AIGatewayImpl({
    adapter,
    tier,
    tierGuard: new TierGuard(new InMemoryRateLimitStore()),
    costGuard: new CostGuard(),
    contextBuilder,
    templateRegistry: registry,
    userId: 'test-user',
    sessionId: 'test-session',
  })
}

function makeStorage() {
  const storage = {
    campaigns: {
      get: vi.fn().mockResolvedValue(CAMPAIGN),
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    characters: {
      get: vi.fn().mockResolvedValue(CHARACTER),
      save: vi.fn().mockImplementation(async (c: CharacterState) => c),
    },
    session: {
      append: vi.fn().mockResolvedValue(undefined),
      appendBatch: vi.fn().mockResolvedValue(undefined),
      getRecent: vi.fn().mockResolvedValue([]),
      getAll: vi.fn().mockResolvedValue([]),
    },
    world: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    },
    export: vi.fn(),
    import: vi.fn(),
    type: 'local' as const,
    supportsRealtime: false,
    requiresAuth: false,
  } as unknown as StorageAdapter & {
    session: { append: ReturnType<typeof vi.fn>; appendBatch: ReturnType<typeof vi.fn> }
    characters: { save: ReturnType<typeof vi.fn> }
  }
  return storage
}

// ── Integration — happy path (strong-hit move) ────────────────────────────────

describe('Integration — happy path (strong-hit move)', () => {
  let storage: ReturnType<typeof makeStorage>
  let mockAdapter: ReturnType<typeof makeMockAdapter>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    mockAdapter = makeMockAdapter()
    const gateway = makeGateway('full-skald', mockAdapter)
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, gateway, new OracleService(), mockDice)
  })

  it('TurnResult has correct shape (turnId, narration, statDeltas, sessionEvents, timestamp)', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.turnId).toBeTypeOf('string')
    expect(turn.narration).toBeTypeOf('string')
    expect(Array.isArray(turn.statDeltas)).toBe(true)
    expect(Array.isArray(turn.sessionEvents)).toBe(true)
    expect(turn.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('TurnResult.narration equals MOCK_NARRATION — mock adapter response flows through', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.narration).toBe(MOCK_NARRATION)
  })

  it('statDeltas equals [{stat:momentum, before:2, after:3}] (face-danger strong-hit)', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.statDeltas).toEqual([{ stat: 'momentum', before: 2, after: 3 }])
  })

  it('appendBatch called once; sessionEvents deep-equals stored events', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(storage.session.appendBatch).toHaveBeenCalledOnce()
    const storedEvents = (storage.session.appendBatch.mock.calls[0] as unknown[])[1] as SessionEvent[]
    expect(turn.sessionEvents).toEqual(storedEvents)
  })

  it('TurnResult.roll.result === "strong-hit"', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.roll?.result).toBe('strong-hit')
  })

  it('MockAdapter.complete called with system prompt containing "move resolver"', async () => {
    await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(mockAdapter.systemPrompts.length).toBeGreaterThan(0)
    expect(mockAdapter.systemPrompts[0]).toContain('move resolver')
  })
})

// ── Integration — miss with oracle auto-trigger ───────────────────────────────

describe('Integration — miss with oracle auto-trigger', () => {
  let storage: ReturnType<typeof makeStorage>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    const gateway = makeGateway()
    const mockDice = { roll: vi.fn().mockReturnValue(MISS_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, gateway, new OracleService(), mockDice)
  })

  it('oracleResults is defined and length > 0', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.oracleResults).toBeDefined()
    expect(turn.oracleResults!.length).toBeGreaterThan(0)
  })

  it('oracleResults[0].tableId === "pay-the-price"', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.oracleResults![0]!.tableId).toBe('pay-the-price')
  })

  it('sessionEvents contains oracle.consulted', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.sessionEvents.map((e) => e.type)).toContain('oracle.consulted')
  })
})

// ── Integration — weak-hit move ───────────────────────────────────────────────

describe('Integration — weak-hit move', () => {
  it('oracleResults is undefined (no oracle trigger on weak-hit)', async () => {
    const storage = makeStorage()
    const gateway = makeGateway()
    const mockDice = { roll: vi.fn().mockReturnValue(WEAK_HIT_ROLL), replay: DiceService.replay }
    const domain = new NarrativeDomain(
      storage,
      ironswornPlugin,
      gateway,
      new OracleService(),
      mockDice
    )
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.oracleResults).toBeUndefined()
  })
})

// ── Integration — offline tier path ──────────────────────────────────────────

describe('Integration — offline tier path', () => {
  let storage: ReturnType<typeof makeStorage>
  let domain: NarrativeDomain

  beforeEach(() => {
    storage = makeStorage()
    const mockAdapter = makeMockAdapter()
    const gateway = makeGateway('offline', mockAdapter)
    const mockDice = { roll: vi.fn().mockReturnValue(STRONG_HIT_ROLL), replay: DiceService.replay }
    domain = new NarrativeDomain(storage, ironswornPlugin, gateway, new OracleService(), mockDice)
  })

  it('narration is empty string when tier is offline', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.narration).toBe('')
  })

  it('outcome is defined with result === "strong-hit" and consequences.length > 0', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.outcome).toBeDefined()
    expect(turn.outcome!.result).toBe('strong-hit')
    expect(turn.outcome!.consequences.length).toBeGreaterThan(0)
  })

  it('appendBatch still called — events committed even on offline tier', async () => {
    await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(storage.session.appendBatch).toHaveBeenCalledOnce()
  })

  it('statDeltas still reflects move consequences on offline tier', async () => {
    const turn = await domain.processTurn('camp-1', {
      type: 'move',
      moveId: 'face-danger',
      statKey: 'edge',
    })
    expect(turn.statDeltas).toEqual([{ stat: 'momentum', before: 2, after: 3 }])
  })
})
