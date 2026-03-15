// ── Oracle domain types ───────────────────────────────────────────────────────

export type Odds =
  | 'small-chance'
  | 'unlikely'
  | 'fifty-fifty'
  | 'likely'
  | 'almost-certain'
  | 'certain'

export interface OracleTable {
  id: string
  rulesetId: string
  name: string
  category: string
  entries: OracleEntry[]
}

export interface OracleEntry {
  /** Inclusive lower bound of d100 roll range */
  min: number
  /** Inclusive upper bound of d100 roll range */
  max: number
  result: string
}

export interface OracleRoll {
  tableId: string
  roll: number
  raw: string
  timestamp: string
}

export interface FatesResult {
  odds: Odds
  roll: number
  /** true = yes, false = no */
  result: boolean
  /** Extreme yes/no — match on doubles */
  extreme: boolean
  timestamp: string
}
