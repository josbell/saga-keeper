// OracleService — ruleset-agnostic oracle rolling and trigger detection
import type { OracleTable, OracleRoll, FatesResult, Odds, MoveOutcome } from '@saga-keeper/domain'

export interface IOracleService {
  roll(tableId: string, tables: OracleTable[]): OracleRoll
  rollAskFates(odds: Odds): FatesResult
  detectTriggers(outcome: MoveOutcome): string[]
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// RANGE is evenly divisible by 100 → no modulo bias, rejection loop never fires
const RANGE = 100_000
const LIMIT = RANGE - (RANGE % 100)

function rollD100(): number {
  let n: number
  do {
    n = Math.floor(Math.random() * RANGE)
  } while (n >= LIMIT)
  return (n % 100) + 1
}

export const ODDS_THRESHOLD: Record<Odds, number> = {
  certain: 100,
  'almost-certain': 90,
  likely: 75,
  'fifty-fifty': 50,
  unlikely: 25,
  'small-chance': 10,
}

function isDoubles(roll: number): boolean {
  const r = roll === 100 ? 0 : roll
  return Math.floor(r / 10) === r % 10
}

// ── OracleService ─────────────────────────────────────────────────────────────

export class OracleService implements IOracleService {
  roll(tableId: string, tables: OracleTable[]): OracleRoll {
    const table = tables.find((t) => t.id === tableId)
    if (!table) throw new Error(`Unknown oracle table: "${tableId}"`)
    const roll = rollD100()
    const entry = table.entries.find((e) => roll >= e.min && roll <= e.max)
    return {
      tableId,
      roll,
      raw: entry?.result ?? `(no entry for ${roll})`,
      timestamp: new Date().toISOString(),
    }
  }

  rollAskFates(odds: Odds): FatesResult {
    const roll = rollD100()
    return {
      odds,
      roll,
      result: roll <= ODDS_THRESHOLD[odds],
      extreme: isDoubles(roll),
      timestamp: new Date().toISOString(),
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
