// CostGuard — TDD test suite

import { describe, it, expect } from 'vitest'
import { CostGuard } from './CostGuard'
import type { AIIntent } from '@saga-keeper/domain'

// ── estimateCost ─────────────────────────────────────────────────────────────

describe('CostGuard.estimateCost()', () => {
  const guard = new CostGuard() // default: charsPerToken=4

  it('returns output estimate when context is empty', () => {
    // oracle.narrate has 256 output estimate, 0 input → 256
    expect(guard.estimateCost('oracle.narrate', 0)).toBe(256)
  })

  it('adds input tokens from context chars (ceiling division)', () => {
    // 100 chars / 4 cpt = 25 input tokens + 256 output = 281
    expect(guard.estimateCost('oracle.narrate', 100)).toBe(281)
  })

  it('uses ceiling division for non-exact char counts', () => {
    // 5 chars / 4 cpt = ceil(5/4) = 2 input tokens + 256 = 258
    expect(guard.estimateCost('oracle.narrate', 5)).toBe(258)
  })

  it('estimates higher cost for hall.reminder (1024 output)', () => {
    expect(guard.estimateCost('hall.reminder', 0)).toBe(1024)
  })

  it('estimates 512 output tokens for skald.narrate', () => {
    expect(guard.estimateCost('skald.narrate', 0)).toBe(512)
  })

  it('estimates 512 output tokens for world.generate', () => {
    expect(guard.estimateCost('world.generate', 0)).toBe(512)
  })

  it('respects custom charsPerToken', () => {
    const custom = new CostGuard({ charsPerToken: 2 })
    // 100 chars / 2 cpt = 50 input + 256 output = 306
    expect(custom.estimateCost('oracle.narrate', 100)).toBe(306)
  })
})

// ── checkBudget ──────────────────────────────────────────────────────────────

describe('CostGuard.checkBudget()', () => {
  it('returns "ok" when session has no spend', () => {
    const guard = new CostGuard({ budget: 10_000 })
    expect(guard.checkBudget('session-1', 1000)).toBe('ok')
  })

  it('returns "ok" when projected spend is under 80% of budget', () => {
    const guard = new CostGuard({ budget: 10_000 })
    // 7000 estimated / 10000 budget = 70% → ok
    expect(guard.checkBudget('session-1', 7000)).toBe('ok')
  })

  it('returns "warn" when projected spend reaches 80% of budget', () => {
    const guard = new CostGuard({ budget: 10_000 })
    // 8000 estimated / 10000 budget = 80% → warn
    expect(guard.checkBudget('session-1', 8000)).toBe('warn')
  })

  it('returns "warn" when projected spend is between 80% and 100%', () => {
    const guard = new CostGuard({ budget: 10_000 })
    expect(guard.checkBudget('session-1', 9000)).toBe('warn')
  })

  it('returns "block" when projected spend reaches 100% of budget', () => {
    const guard = new CostGuard({ budget: 10_000 })
    expect(guard.checkBudget('session-1', 10_000)).toBe('block')
  })

  it('returns "block" when projected spend exceeds budget', () => {
    const guard = new CostGuard({ budget: 10_000 })
    expect(guard.checkBudget('session-1', 15_000)).toBe('block')
  })

  it('accounts for previously recorded spend', () => {
    const guard = new CostGuard({ budget: 10_000 })
    guard.recordSpend('session-1', 7000)
    // 7000 spent + 2000 estimated = 9000 / 10000 = 90% → warn
    expect(guard.checkBudget('session-1', 2000)).toBe('warn')
  })

  it('blocks when recorded spend + estimated reaches budget', () => {
    const guard = new CostGuard({ budget: 10_000 })
    guard.recordSpend('session-1', 9000)
    // 9000 + 1000 = 10000 → block
    expect(guard.checkBudget('session-1', 1000)).toBe('block')
  })

  it('tracks sessions independently', () => {
    const guard = new CostGuard({ budget: 10_000 })
    guard.recordSpend('session-1', 9500)
    // session-2 has no spend yet → ok
    expect(guard.checkBudget('session-2', 1000)).toBe('ok')
  })
})

// ── recordSpend ──────────────────────────────────────────────────────────────

describe('CostGuard.recordSpend()', () => {
  it('accumulates spend across multiple calls', () => {
    const guard = new CostGuard({ budget: 10_000 })
    guard.recordSpend('session-1', 3000)
    guard.recordSpend('session-1', 2000)
    // 5000 spent + 4000 estimated = 9000 / 10000 = 90% → warn
    expect(guard.checkBudget('session-1', 4000)).toBe('warn')
  })

  it('does not affect other sessions', () => {
    const guard = new CostGuard({ budget: 10_000 })
    guard.recordSpend('session-1', 9000)
    guard.recordSpend('session-2', 1000)
    // session-2: 1000 spent + 1000 estimated = 2000 → ok
    expect(guard.checkBudget('session-2', 1000)).toBe('ok')
  })
})

// ── Constructor defaults ─────────────────────────────────────────────────────

describe('CostGuard — constructor defaults', () => {
  it('uses budget=50000 by default', () => {
    const guard = new CostGuard()
    // With default budget of 50k, spending 40k (80%) should warn
    expect(guard.checkBudget('s', 40_000)).toBe('warn')
    expect(guard.checkBudget('s', 39_999)).toBe('ok')
  })

  it('uses charsPerToken=4 by default', () => {
    const guard = new CostGuard()
    // 400 chars / 4 cpt = 100 input + 256 output = 356
    expect(guard.estimateCost('oracle.narrate', 400)).toBe(356)
  })
})
