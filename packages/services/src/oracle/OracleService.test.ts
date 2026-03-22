import { describe, it, expect, afterEach, vi } from 'vitest'
import { OracleService } from './OracleService'
import type { OracleTable, MoveOutcome } from '@saga-keeper/domain'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_TABLE: OracleTable = {
  id: 'simple-table',
  rulesetId: 'test',
  name: 'Simple Table',
  category: 'test',
  entries: [
    { min: 1, max: 50, result: 'First half' },
    { min: 51, max: 100, result: 'Second half' },
  ],
}

const RANGED_TABLE: OracleTable = {
  id: 'ranged-table',
  rulesetId: 'test',
  name: 'Ranged Table',
  category: 'test',
  entries: [
    { min: 1, max: 10, result: 'Very rare' },
    { min: 11, max: 30, result: 'Uncommon' },
    { min: 31, max: 70, result: 'Common' },
    { min: 71, max: 90, result: 'Likely' },
    { min: 91, max: 100, result: 'Certain' },
  ],
}

const TABLES = [SIMPLE_TABLE, RANGED_TABLE]

function makeMissOutcome(match = false): MoveOutcome {
  return { result: 'miss', match, consequences: [], narrativeHints: ['Pay the Price.'] }
}

function makeHitOutcome(result: 'strong-hit' | 'weak-hit'): MoveOutcome {
  return { result, match: false, consequences: [], narrativeHints: ['You succeed.'] }
}

// ── OracleService.roll ────────────────────────────────────────────────────────

describe('OracleService.roll', () => {
  const oracle = new OracleService()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a roll between 1 and 100', () => {
    const result = oracle.roll('simple-table', TABLES)
    expect(result.roll).toBeGreaterThanOrEqual(1)
    expect(result.roll).toBeLessThanOrEqual(100)
  })

  it('returns a non-empty raw string', () => {
    const result = oracle.roll('simple-table', TABLES)
    expect(result.raw.length).toBeGreaterThan(0)
  })

  it('returns the correct tableId on the result', () => {
    const result = oracle.roll('simple-table', TABLES)
    expect(result.tableId).toBe('simple-table')
  })

  it('includes a timestamp', () => {
    const result = oracle.roll('simple-table', TABLES)
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('throws for an unknown tableId', () => {
    expect(() => oracle.roll('nonexistent', TABLES)).toThrow(/Unknown oracle table: "nonexistent"/)
  })

  it('resolves entries across a ranged table without error', () => {
    // Run 30 rolls on a table with uneven ranges to confirm all results resolve
    for (let i = 0; i < 30; i++) {
      const result = oracle.roll('ranged-table', TABLES)
      expect(result.raw).not.toMatch(/^\(no entry/)
    }
  })
})

// ── OracleService.rollAskFates ────────────────────────────────────────────────

describe('OracleService.rollAskFates', () => {
  const oracle = new OracleService()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the correct structure', () => {
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result).toMatchObject({
      odds: 'fifty-fifty',
      result: expect.any(Boolean),
      extreme: expect.any(Boolean),
    })
    expect(result.roll).toBeGreaterThanOrEqual(1)
    expect(result.roll).toBeLessThanOrEqual(100)
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('certain odds always resolves to true', () => {
    for (let i = 0; i < 20; i++) {
      expect(oracle.rollAskFates('certain').result).toBe(true)
    }
  })

  it('small-chance always has the correct structure', () => {
    const result = oracle.rollAskFates('small-chance')
    expect(result.odds).toBe('small-chance')
    expect(typeof result.result).toBe('boolean')
    expect(typeof result.extreme).toBe('boolean')
  })

  it('echoes the odds value on the result', () => {
    const odds = 'likely' as const
    expect(oracle.rollAskFates(odds).odds).toBe(odds)
  })

  it('extreme flag is true when roll is doubles (roll=11)', () => {
    // Math.floor(0.10 * 100) + 1 = 11; isDoubles(11): floor(1)===1 → true
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(11)
    expect(result.extreme).toBe(true)
  })

  it('extreme flag is false when roll is not doubles (roll=12)', () => {
    // Math.floor(0.11 * 100) + 1 = 12; isDoubles(12): floor(1)!==2 → false
    vi.spyOn(Math, 'random').mockReturnValue(0.11)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(12)
    expect(result.extreme).toBe(false)
  })

  it('extreme flag is true for roll=100 (isDoubles treats 100 as 00, the only special case)', () => {
    // Math.floor(0.995 * 100) + 1 = 100; isDoubles(100) remaps to 0 → floor(0)===0 → true
    vi.spyOn(Math, 'random').mockReturnValue(0.995)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(100)
    expect(result.extreme).toBe(true)
  })
})

// ── OracleService — injectable PRNG + seed (#18) ─────────────────────────────

describe('OracleService — injectable PRNG', () => {
  it('roll() is deterministic with a fixed PRNG', () => {
    // Math.floor(0.5 * 100) + 1 = 51
    const oracle = new OracleService(() => 0.5)
    const r1 = oracle.roll('simple-table', TABLES)
    const r2 = oracle.roll('simple-table', TABLES)
    expect(r1.roll).toBe(r2.roll)
    expect(r1.raw).toBe(r2.raw)
  })

  it('rollAskFates() is deterministic with a fixed PRNG', () => {
    const oracle = new OracleService(() => 0.5)
    const r1 = oracle.rollAskFates('fifty-fifty')
    const r2 = oracle.rollAskFates('fifty-fifty')
    expect(r1.roll).toBe(r2.roll)
    expect(r1.result).toBe(r2.result)
  })

  it('roll() returns a seed field', () => {
    const oracle = new OracleService(() => 0.5)
    const result = oracle.roll('simple-table', TABLES)
    expect(result.seed).toBeDefined()
    expect(typeof result.seed).toBe('string')
  })

  it('rollAskFates() returns a seed field', () => {
    const oracle = new OracleService(() => 0.5)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.seed).toBeDefined()
    expect(typeof result.seed).toBe('string')
  })

  it('seed round-trips: replaying the seed via injected PRNG reproduces the same roll', () => {
    const oracle = new OracleService(() => 0.5)
    const r1 = oracle.roll('simple-table', TABLES)
    // Reconstruct PRNG from seed: seed is the raw float passed to rand()
    const seedFloat = parseFloat(r1.seed!)
    const oracleReplay = new OracleService(() => seedFloat)
    const r2 = oracleReplay.roll('simple-table', TABLES)
    expect(r2.roll).toBe(r1.roll)
    expect(r2.raw).toBe(r1.raw)
  })

  it('existing Math.random spy approach still works with default PRNG', () => {
    // Math.floor(0.10 * 100) + 1 = 11
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const oracle = new OracleService()
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(11)
    vi.restoreAllMocks()
  })

  it('roll() throws when PRNG returns NaN', () => {
    const oracle = new OracleService(() => NaN)
    expect(() => oracle.roll('simple-table', TABLES)).toThrow(/must return a value in \[0, 1\)/)
  })

  it('roll() throws when PRNG returns 1 (upper boundary, would produce roll=101)', () => {
    const oracle = new OracleService(() => 1)
    expect(() => oracle.roll('simple-table', TABLES)).toThrow(/must return a value in \[0, 1\)/)
  })

  it('rollAskFates() throws when PRNG returns a negative value', () => {
    const oracle = new OracleService(() => -0.1)
    expect(() => oracle.rollAskFates('fifty-fifty')).toThrow(/must return a value in \[0, 1\)/)
  })
})

// ── OracleService.detectTriggers ──────────────────────────────────────────────

describe('OracleService.detectTriggers', () => {
  const oracle = new OracleService()

  it('returns ["pay-the-price"] for a miss outcome', () => {
    expect(oracle.detectTriggers(makeMissOutcome())).toEqual(['pay-the-price'])
  })

  it('returns [] for a strong-hit outcome', () => {
    expect(oracle.detectTriggers(makeHitOutcome('strong-hit'))).toEqual([])
  })

  it('returns [] for a weak-hit outcome', () => {
    expect(oracle.detectTriggers(makeHitOutcome('weak-hit'))).toEqual([])
  })

  it('returns ["pay-the-price"] for a miss with match=true', () => {
    expect(oracle.detectTriggers(makeMissOutcome(true))).toEqual(['pay-the-price'])
  })
})
