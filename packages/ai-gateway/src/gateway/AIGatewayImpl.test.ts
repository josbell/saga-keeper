// AIGatewayImpl — TDD test suite

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  AIGatewayImpl,
  TierBlockedError,
  QuotaExceededError,
  BudgetExceededError,
} from './AIGatewayImpl'
import type {
  CompletionRequest,
  CompletionOptions,
  Message,
  GameContext,
  ProviderAdapter,
  ProviderCapabilities,
} from '@saga-keeper/domain'
import type { ITierGuard, RateLimitResult } from '../tiers/TierGuard'
import type { ICostGuard } from '../cost/CostGuard'
import type { IContextBuilder } from '../context/ContextBuilder'
import { TemplateRegistry } from '../templates/TemplateRegistry'

// ── Test doubles ─────────────────────────────────────────────────────────────

function makeContext(): GameContext {
  return {
    rulesetId: 'ironsworn-v1',
    characters: [],
    world: { entities: [], totalEntityCount: 0 },
    recentEvents: [],
    oracleHistory: [],
  }
}

function makeRequest(overrides?: Partial<CompletionRequest>): CompletionRequest {
  return {
    intent: 'skald.narrate',
    context: makeContext(),
    ...overrides,
  }
}

function makeTierGuard(overrides?: Partial<ITierGuard>): ITierGuard {
  return {
    isAllowed: vi.fn().mockReturnValue(true),
    getFallback: vi.fn().mockReturnValue('Fallback text'),
    checkQuota: vi.fn().mockResolvedValue({ allowed: true, remaining: 10 }),
    ...overrides,
  }
}

function makeCostGuard(overrides?: Partial<ICostGuard>): ICostGuard {
  return {
    checkBudget: vi.fn().mockReturnValue('ok'),
    recordSpend: vi.fn(),
    estimateCost: vi.fn().mockReturnValue(500),
    ...overrides,
  }
}

function makeContextBuilder(prompt?: string): IContextBuilder {
  return {
    build: vi.fn().mockReturnValue(prompt ?? 'You are a skald.'),
  }
}

function makeAdapter(overrides?: Partial<ProviderAdapter>): ProviderAdapter {
  return {
    id: 'test-adapter',
    displayName: 'Test Adapter',
    complete: vi.fn().mockResolvedValue('The raven speaks.'),
    stream: vi.fn().mockImplementation(async function* () {
      yield 'Once '
      yield 'upon '
      yield 'a time'
    }),
    getCapabilities: vi.fn().mockReturnValue({
      streaming: true,
      maxContextTokens: 200_000,
      supportsSystemPrompt: true,
      localOnly: false,
    } satisfies ProviderCapabilities),
    ...overrides,
  }
}

function makeGateway(overrides?: {
  adapter?: ProviderAdapter
  tierGuard?: ITierGuard
  costGuard?: ICostGuard
  contextBuilder?: IContextBuilder
}) {
  return new AIGatewayImpl({
    adapter: overrides?.adapter ?? makeAdapter(),
    tier: 'assisted',
    tierGuard: overrides?.tierGuard ?? makeTierGuard(),
    costGuard: overrides?.costGuard ?? makeCostGuard(),
    contextBuilder: overrides?.contextBuilder ?? makeContextBuilder(),
    templateRegistry: new TemplateRegistry(),
    userId: 'user-1',
    sessionId: 'session-1',
  })
}

async function collectStream(
  iterable: AsyncIterable<{ delta: string; done: boolean }>
): Promise<string[]> {
  const out: string[] = []
  for await (const chunk of iterable) {
    if (!chunk.done) out.push(chunk.delta)
  }
  return out
}

// ── getTier / getCapabilities ────────────────────────────────────────────────

describe('AIGatewayImpl — identity', () => {
  it('returns the configured tier', () => {
    const gateway = makeGateway()
    expect(gateway.getTier()).toBe('assisted')
  })

  it('delegates getCapabilities to the adapter', () => {
    const adapter = makeAdapter()
    const gateway = makeGateway({ adapter })
    const caps = gateway.getCapabilities()
    expect(caps.streaming).toBe(true)
    expect(adapter.getCapabilities).toHaveBeenCalled()
  })
})

// ── complete() — guard enforcement ───────────────────────────────────────────

describe('AIGatewayImpl.complete() — tier guard', () => {
  it('throws TierBlockedError when intent is not allowed', async () => {
    const tierGuard = makeTierGuard({
      isAllowed: vi.fn().mockReturnValue(false),
      getFallback: vi.fn().mockReturnValue('Upgrade required'),
    })
    const gateway = makeGateway({ tierGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow(TierBlockedError)
  })

  it('includes fallback text in TierBlockedError', async () => {
    const tierGuard = makeTierGuard({
      isAllowed: vi.fn().mockReturnValue(false),
      getFallback: vi.fn().mockReturnValue('Upgrade required'),
    })
    const gateway = makeGateway({ tierGuard })
    try {
      await gateway.complete(makeRequest())
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(TierBlockedError)
      expect((err as TierBlockedError).fallback).toBe('Upgrade required')
    }
  })
})

describe('AIGatewayImpl.complete() — quota guard', () => {
  it('throws QuotaExceededError when daily quota is exhausted', async () => {
    const tierGuard = makeTierGuard({
      checkQuota: vi.fn().mockResolvedValue({ allowed: false, remaining: 0 }),
    })
    const gateway = makeGateway({ tierGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow(QuotaExceededError)
  })
})

describe('AIGatewayImpl.complete() — cost guard', () => {
  it('throws BudgetExceededError when session budget is exhausted', async () => {
    const costGuard = makeCostGuard({
      checkBudget: vi.fn().mockReturnValue('block'),
    })
    const gateway = makeGateway({ costGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow(BudgetExceededError)
  })

  it('allows request when cost guard returns "warn"', async () => {
    const costGuard = makeCostGuard({
      checkBudget: vi.fn().mockReturnValue('warn'),
    })
    const gateway = makeGateway({ costGuard })
    const result = await gateway.complete(makeRequest())
    expect(result.text).toBe('The raven speaks.')
  })
})

// ── complete() — happy path ──────────────────────────────────────────────────

describe('AIGatewayImpl.complete() — happy path', () => {
  it('returns text from the adapter', async () => {
    const gateway = makeGateway()
    const result = await gateway.complete(makeRequest())
    expect(result.text).toBe('The raven speaks.')
  })

  it('returns the request intent in the response', async () => {
    const gateway = makeGateway()
    const result = await gateway.complete(makeRequest({ intent: 'oracle.narrate' }))
    expect(result.intent).toBe('oracle.narrate')
  })

  it('passes system prompt from context builder to adapter', async () => {
    const adapter = makeAdapter()
    const contextBuilder = makeContextBuilder('Custom system prompt')
    const gateway = makeGateway({ adapter, contextBuilder })
    await gateway.complete(makeRequest())
    expect(adapter.complete).toHaveBeenCalledWith(
      'Custom system prompt',
      expect.any(Array),
      expect.any(Object)
    )
  })

  it('appends userMessage to history for the adapter', async () => {
    const adapter = makeAdapter()
    const gateway = makeGateway({ adapter })
    await gateway.complete(makeRequest({ userMessage: 'Tell me a story' }))
    const passedMessages = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Message[]
    expect(passedMessages.some((m) => m.content === 'Tell me a story')).toBe(true)
  })

  it('records spend after successful completion', async () => {
    const costGuard = makeCostGuard()
    const gateway = makeGateway({ costGuard })
    await gateway.complete(makeRequest())
    expect(costGuard.recordSpend).toHaveBeenCalledWith('session-1', expect.any(Number))
  })

  it('does not call adapter when tier guard blocks', async () => {
    const adapter = makeAdapter()
    const tierGuard = makeTierGuard({
      isAllowed: vi.fn().mockReturnValue(false),
    })
    const gateway = makeGateway({ adapter, tierGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow()
    expect(adapter.complete).not.toHaveBeenCalled()
  })
})

// ── stream() — guard enforcement ─────────────────────────────────────────────

describe('AIGatewayImpl.stream() — guard enforcement', () => {
  it('throws TierBlockedError when intent is not allowed', async () => {
    const tierGuard = makeTierGuard({
      isAllowed: vi.fn().mockReturnValue(false),
    })
    const gateway = makeGateway({ tierGuard })
    await expect(collectStream(gateway.stream(makeRequest()))).rejects.toThrow(TierBlockedError)
  })

  it('throws QuotaExceededError when daily quota is exhausted', async () => {
    const tierGuard = makeTierGuard({
      checkQuota: vi.fn().mockResolvedValue({ allowed: false, remaining: 0 }),
    })
    const gateway = makeGateway({ tierGuard })
    await expect(collectStream(gateway.stream(makeRequest()))).rejects.toThrow(QuotaExceededError)
  })

  it('throws BudgetExceededError when session budget is exhausted', async () => {
    const costGuard = makeCostGuard({
      checkBudget: vi.fn().mockReturnValue('block'),
    })
    const gateway = makeGateway({ costGuard })
    await expect(collectStream(gateway.stream(makeRequest()))).rejects.toThrow(BudgetExceededError)
  })
})

// ── stream() — happy path ────────────────────────────────────────────────────

describe('AIGatewayImpl.stream() — happy path', () => {
  it('yields text deltas from the adapter', async () => {
    const gateway = makeGateway()
    const chunks = await collectStream(gateway.stream(makeRequest()))
    expect(chunks).toEqual(['Once ', 'upon ', 'a time'])
  })

  it('emits a final chunk with done: true', async () => {
    const gateway = makeGateway()
    const all: Array<{ delta: string; done: boolean }> = []
    for await (const chunk of gateway.stream(makeRequest())) {
      all.push(chunk)
    }
    const last = all[all.length - 1]
    expect(last).toEqual({ delta: '', done: true })
  })

  it('records spend after stream completes', async () => {
    const costGuard = makeCostGuard()
    const gateway = makeGateway({ costGuard })
    await collectStream(gateway.stream(makeRequest()))
    expect(costGuard.recordSpend).toHaveBeenCalledWith('session-1', expect.any(Number))
  })
})

// ── Guard order ──────────────────────────────────────────────────────────────

describe('AIGatewayImpl — guard execution order', () => {
  it('checks tier before quota (tier block prevents quota decrement)', async () => {
    const tierGuard = makeTierGuard({
      isAllowed: vi.fn().mockReturnValue(false),
    })
    const gateway = makeGateway({ tierGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow(TierBlockedError)
    expect(tierGuard.checkQuota).not.toHaveBeenCalled()
  })

  it('checks quota before cost (quota block prevents cost estimation)', async () => {
    const tierGuard = makeTierGuard({
      checkQuota: vi.fn().mockResolvedValue({ allowed: false, remaining: 0 }),
    })
    const costGuard = makeCostGuard()
    const gateway = makeGateway({ tierGuard, costGuard })
    await expect(gateway.complete(makeRequest())).rejects.toThrow(QuotaExceededError)
    expect(costGuard.checkBudget).not.toHaveBeenCalled()
  })
})
