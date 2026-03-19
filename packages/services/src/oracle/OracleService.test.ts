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

  afterEach(() => { vi.restoreAllMocks() })

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

  afterEach(() => { vi.restoreAllMocks() })

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
    // RANGE=100_000: Math.floor(0.0001 * 100_000) = 10, roll = (10 % 100) + 1 = 11
    // isDoubles(11): floor(11/10)=1, 11%10=1 → 1===1 → true
    vi.spyOn(Math, 'random').mockReturnValue(0.0001)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(11)
    expect(result.extreme).toBe(true)
  })

  it('extreme flag is false when roll is not doubles (roll=12)', () => {
    // Math.floor(0.00011 * 100_000) = 11, roll = (11 % 100) + 1 = 12
    // isDoubles(12): floor(12/10)=1, 12%10=2 → 1!==2 → false
    vi.spyOn(Math, 'random').mockReturnValue(0.00011)
    const result = oracle.rollAskFates('fifty-fifty')
    expect(result.roll).toBe(12)
    expect(result.extreme).toBe(false)
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
