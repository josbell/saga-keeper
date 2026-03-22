// OracleService — ruleset-agnostic oracle rolling and trigger detection
import type { OracleTable, OracleRoll, FatesResult, Odds, MoveOutcome } from '@saga-keeper/domain'

export interface IOracleService {
  roll(tableId: string, tables: OracleTable[]): OracleRoll
  rollAskFates(odds: Odds): FatesResult
  detectTriggers(outcome: MoveOutcome): string[]
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// rand() ∈ [0, 1) → d100 in [1, 100].
// Note: Math.random() has ~2^53 possible values; 2^53 % 100 ≠ 0, so there is a
// negligible modulo bias (~1.1e-14). For a TTRPG game this is indistinguishable
// from uniform. A crypto-quality approach would use rejection sampling over
// Math.floor(rand() * 2^k) with k chosen so 2^k >> 100, but is not warranted here.
function rollD100(rand: () => number): { roll: number; seed: string } {
  const raw = rand()
  if (!Number.isFinite(raw) || raw < 0 || raw >= 1) {
    throw new Error(`OracleService rand() must return a value in [0, 1), got ${raw}`)
  }
  return { roll: Math.floor(raw * 100) + 1, seed: String(raw) }
}

export const ODDS_THRESHOLD: Record<Odds, number> = {
  // Infinity ensures 'certain' always resolves true regardless of roll range changes.
  certain: Infinity,
  'almost-certain': 90,
  likely: 75,
  'fifty-fifty': 50,
  unlikely: 25,
  'small-chance': 10,
}

// Ironsworn "doubles": tens digit === units digit.
// roll=100 is treated as two 0s (00 on a d10 pair) → remapped to 0 before digit check.
function isDoubles(roll: number): boolean {
  const r = roll === 100 ? 0 : roll
  return Math.floor(r / 10) === r % 10
}

// ── OracleService ─────────────────────────────────────────────────────────────

export class OracleService implements IOracleService {
  // Default wraps Math.random via arrow function so vi.spyOn still intercepts it
  constructor(private readonly rand: () => number = () => Math.random()) {}

  roll(tableId: string, tables: OracleTable[]): OracleRoll {
    const table = tables.find((t) => t.id === tableId)
    if (!table) throw new Error(`Unknown oracle table: "${tableId}"`)
    const { roll, seed } = rollD100(this.rand)
    const entry = table.entries.find((e) => roll >= e.min && roll <= e.max)
    return {
      tableId,
      roll,
      raw: entry?.result ?? `(no entry for ${roll})`,
      timestamp: new Date().toISOString(),
      seed,
    }
  }

  rollAskFates(odds: Odds): FatesResult {
    const { roll, seed } = rollD100(this.rand)
    return {
      odds,
      roll,
      result: roll <= ODDS_THRESHOLD[odds],
      extreme: isDoubles(roll),
      timestamp: new Date().toISOString(),
      seed,
    }
  }

  detectTriggers(outcome: MoveOutcome): string[] {
    // TODO: match misses (outcome.match === true) are more severe in Ironsworn and could
    // warrant a different oracle prompt (e.g. 'complication'). Requires agreement on
    // a ruleset-agnostic table ID convention before extending this.
    if (outcome.result === 'miss') return ['pay-the-price']
    return []
  }
}
