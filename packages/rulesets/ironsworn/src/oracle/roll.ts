// Oracle rolling logic — crypto-fair d100 rolls against Ironsworn tables
import type { OracleRoll, FatesResult, Odds } from '@saga-keeper/domain'
import { ORACLE_TABLES } from './tables'

// Threshold: roll ≤ threshold = yes
const ODDS_THRESHOLD: Record<Odds, number> = {
  certain: 100,
  'almost-certain': 90,
  likely: 75,
  'fifty-fifty': 50,
  unlikely: 25,
  'small-chance': 10,
}

/** Rejection-sampled d100 using crypto.getRandomValues() — no modulo bias */
function rollD100(): number {
  const arr = new Uint32Array(1)
  // 2^32 = 4294967296; limit = largest multiple of 100 below 2^32
  const limit = 4294967296 - (4294967296 % 100)
  do {
    crypto.getRandomValues(arr)
  } while (arr[0]! >= limit)
  return (arr[0]! % 100) + 1
}

/**
 * A roll is "on doubles" when the tens and units digits match (11, 22, 33, …, 99, 100→00).
 * Used to flag extreme yes/no results when asking the oracle.
 */
function isDoubles(roll: number): boolean {
  const r = roll === 100 ? 0 : roll
  return Math.floor(r / 10) === r % 10
}

export function rollOnTable(tableId: string): OracleRoll {
  const table = ORACLE_TABLES.find((t) => t.id === tableId)
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

export function rollAskFates(odds: Odds): FatesResult {
  const roll = rollD100()
  const threshold = ODDS_THRESHOLD[odds]
  return {
    odds,
    roll,
    result: roll <= threshold,
    extreme: isDoubles(roll),
    timestamp: new Date().toISOString(),
  }
}
