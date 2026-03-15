// ── Dice domain types ─────────────────────────────────────────────────────────

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface DiceRollRequest {
  action: DieType
  challenge: [DieType, DieType]
  modifier: number
  /** Seed for deterministic replay */
  seed?: string
}

export interface DiceRoll {
  request: DiceRollRequest
  actionDie: number
  challengeDice: [number, number]
  modifier: number
  total: number
  seed: string
  rolledAt: string
}
