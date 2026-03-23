import { describe, it, expect } from 'vitest'
import { rollDice } from './rollDice'

// Helper: create a deterministic RNG from a fixed sequence
function seqRng(...values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]!
}

// rollDice calls rng three times: actionDie (d6), challengeDie1 (d10), challengeDie2 (d10)
// rng returns [0,1), so Math.floor(rng() * 6) + 1 gives d6, etc.

describe('rollDice — outcome classification', () => {
  it('returns strong-hit when action score beats both challenge dice', () => {
    // d6: 0.9 → 6, d10: 0.0 → 1, d10: 0.0 → 1; stat=0 → score=6 > 1 and 1
    const result = rollDice(0, { random: seqRng(0.9, 0.0, 0.0) })
    expect(result.outcome).toBe('strong-hit')
  })

  it('returns weak-hit when action score beats exactly one challenge die', () => {
    // d6: 0.9 → 6, d10: 0.0 → 1, d10: 0.9 → 10; stat=0 → score=6 > 1 but not 10
    const result = rollDice(0, { random: seqRng(0.9, 0.0, 0.9) })
    expect(result.outcome).toBe('weak-hit')
  })

  it('returns miss when action score beats neither challenge die', () => {
    // d6: 0.0 → 1, d10: 0.9 → 10, d10: 0.8 → 9; stat=0 → score=1 < 10 and 9
    const result = rollDice(0, { random: seqRng(0.0, 0.9, 0.8) })
    expect(result.outcome).toBe('miss')
  })
})

describe('rollDice — result shape', () => {
  it('returns actionDie clamped to 1–6', () => {
    const result = rollDice(2, { random: seqRng(0.0, 0.5, 0.5) })
    expect(result.actionDie).toBeGreaterThanOrEqual(1)
    expect(result.actionDie).toBeLessThanOrEqual(6)
  })

  it('returns challengeDice clamped to 1–10', () => {
    const result = rollDice(2, { random: seqRng(0.5, 0.0, 0.99) })
    expect(result.challengeDie1).toBeGreaterThanOrEqual(1)
    expect(result.challengeDie1).toBeLessThanOrEqual(10)
    expect(result.challengeDie2).toBeGreaterThanOrEqual(1)
    expect(result.challengeDie2).toBeLessThanOrEqual(10)
  })

  it('includes actionScore = actionDie + statValue', () => {
    // d6: 0.5 → 3 + stat 2 = 5
    const result = rollDice(2, { random: seqRng(0.5, 0.5, 0.5) })
    expect(result.actionScore).toBe(result.actionDie + 2)
  })

  it('works with stat=0', () => {
    const result = rollDice(0, { random: seqRng(0.5, 0.5, 0.5) })
    expect(result.actionScore).toBe(result.actionDie)
  })
})

describe('rollDice — uses Math.random by default', () => {
  it('returns a valid result without custom RNG', () => {
    const result = rollDice(3)
    expect(['strong-hit', 'weak-hit', 'miss']).toContain(result.outcome)
    expect(result.actionDie).toBeGreaterThanOrEqual(1)
    expect(result.actionDie).toBeLessThanOrEqual(6)
  })
})
