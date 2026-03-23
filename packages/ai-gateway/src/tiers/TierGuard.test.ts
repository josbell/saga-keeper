// TierGuard — TDD test suite

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  TierGuard,
  InMemoryRateLimitStore,
  type RateLimitStore,
} from './TierGuard'
import type { AITier, AIIntent } from '@saga-keeper/domain'

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALL_INTENTS: AIIntent[] = [
  'oracle.narrate',
  'oracle.extract',
  'skald.narrate',
  'skald.move',
  'world.generate',
  'world.expand',
  'event.generate',
  'forge.counsel',
  'hall.reminder',
  'npc.generate',
]

const ASSISTED_INTENTS: AIIntent[] = [
  'oracle.narrate',
  'oracle.extract',
  'skald.narrate',
  'skald.move',
]

const FULL_SKALD_ONLY_INTENTS: AIIntent[] = [
  'world.generate',
  'world.expand',
  'event.generate',
  'forge.counsel',
  'hall.reminder',
  'npc.generate',
]

function makeGuard(store?: RateLimitStore): TierGuard {
  return new TierGuard(store ?? new InMemoryRateLimitStore())
}

// ── isAllowed — feature gating ───────────────────────────────────────────────

describe('TierGuard.isAllowed() — offline tier', () => {
  const guard = makeGuard()

  it('blocks all intents for offline tier', () => {
    for (const intent of ALL_INTENTS) {
      expect(guard.isAllowed('offline', intent)).toBe(false)
    }
  })
})

describe('TierGuard.isAllowed() — assisted tier', () => {
  const guard = makeGuard()

  it('allows oracle and skald intents', () => {
    for (const intent of ASSISTED_INTENTS) {
      expect(guard.isAllowed('assisted', intent)).toBe(true)
    }
  })

  it('blocks world, forge, and hall intents', () => {
    for (const intent of FULL_SKALD_ONLY_INTENTS) {
      expect(guard.isAllowed('assisted', intent)).toBe(false)
    }
  })
})

describe('TierGuard.isAllowed() — full-skald tier', () => {
  const guard = makeGuard()

  it('allows all intents', () => {
    for (const intent of ALL_INTENTS) {
      expect(guard.isAllowed('full-skald', intent)).toBe(true)
    }
  })
})

// ── getFallback ──────────────────────────────────────────────────────────────

describe('TierGuard.getFallback()', () => {
  const guard = makeGuard()

  it('returns a non-empty string for every intent', () => {
    for (const intent of ALL_INTENTS) {
      const msg = guard.getFallback(intent)
      expect(msg.length).toBeGreaterThan(0)
    }
  })

  it('mentions "full-skald" for full-skald-only intents', () => {
    for (const intent of FULL_SKALD_ONLY_INTENTS) {
      expect(guard.getFallback(intent)).toContain('full-skald')
    }
  })
})

// ── event.generate — tier access ─────────────────────────────────────────────

describe('TierGuard — event.generate intent', () => {
  const guard = makeGuard()

  it('is allowed for full-skald tier', () => {
    expect(guard.isAllowed('full-skald', 'event.generate')).toBe(true)
  })

  it('is blocked for assisted tier', () => {
    expect(guard.isAllowed('assisted', 'event.generate')).toBe(false)
  })

  it('is blocked for offline tier', () => {
    expect(guard.isAllowed('offline', 'event.generate')).toBe(false)
  })

  it('getFallback returns a non-empty string mentioning full-skald', () => {
    const msg = guard.getFallback('event.generate')
    expect(msg.length).toBeGreaterThan(0)
    expect(msg).toContain('full-skald')
  })
})

// ── checkQuota — rate limiting ───────────────────────────────────────────────

describe('TierGuard.checkQuota() — offline tier', () => {
  it('always returns allowed: false with remaining: 0', async () => {
    const guard = makeGuard()
    const result = await guard.checkQuota('user-1', 'offline')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })
})

describe('TierGuard.checkQuota() — assisted tier (limit 20)', () => {
  let store: InMemoryRateLimitStore
  let guard: TierGuard

  beforeEach(() => {
    store = new InMemoryRateLimitStore()
    guard = new TierGuard(store)
  })

  it('allows the first request and reports 19 remaining', async () => {
    const result = await guard.checkQuota('user-1', 'assisted')
    expect(result).toEqual({ allowed: true, remaining: 19 })
  })

  it('decrements remaining on successive calls', async () => {
    await guard.checkQuota('user-1', 'assisted') // 19
    const result = await guard.checkQuota('user-1', 'assisted') // 18
    expect(result).toEqual({ allowed: true, remaining: 18 })
  })

  it('blocks after 20 requests and reports 0 remaining', async () => {
    for (let i = 0; i < 20; i++) {
      await guard.checkQuota('user-1', 'assisted')
    }
    const result = await guard.checkQuota('user-1', 'assisted')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })

  it('tracks users independently', async () => {
    for (let i = 0; i < 20; i++) {
      await guard.checkQuota('user-1', 'assisted')
    }
    const result = await guard.checkQuota('user-2', 'assisted')
    expect(result.allowed).toBe(true)
  })
})

describe('TierGuard.checkQuota() — full-skald tier (limit 100)', () => {
  it('allows the first request and reports 99 remaining', async () => {
    const guard = makeGuard()
    const result = await guard.checkQuota('user-1', 'full-skald')
    expect(result).toEqual({ allowed: true, remaining: 99 })
  })
})

// ── InMemoryRateLimitStore ───────────────────────────────────────────────────

describe('InMemoryRateLimitStore', () => {
  it('returns undefined for unknown keys', async () => {
    const store = new InMemoryRateLimitStore()
    expect(await store.get('missing')).toBeUndefined()
  })

  it('stores and retrieves a value', async () => {
    const store = new InMemoryRateLimitStore()
    await store.set('key', 42, 60)
    expect(await store.get('key')).toBe(42)
  })

  it('returns undefined for expired keys', async () => {
    const store = new InMemoryRateLimitStore()
    vi.useFakeTimers()
    try {
      await store.set('key', 1, 10) // expires in 10s
      vi.advanceTimersByTime(11_000) // advance 11s
      expect(await store.get('key')).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not expire before TTL', async () => {
    const store = new InMemoryRateLimitStore()
    vi.useFakeTimers()
    try {
      await store.set('key', 5, 60)
      vi.advanceTimersByTime(59_000)
      expect(await store.get('key')).toBe(5)
    } finally {
      vi.useRealTimers()
    }
  })

  it('overwrites existing keys', async () => {
    const store = new InMemoryRateLimitStore()
    await store.set('key', 1, 60)
    await store.set('key', 2, 60)
    expect(await store.get('key')).toBe(2)
  })
})
