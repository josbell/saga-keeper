import type { DiceRoll, DiceRollRequest, DieType } from '@saga-keeper/domain'

const SIDES: Record<DieType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
}

// ── LCG for seeded replay ──────────────────────────────────────────────────
// Parameters from Numerical Recipes. Gives deterministic replay from seed.
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_M = 2 ** 32

function lcgNext(state: number): number {
  return (LCG_A * state + LCG_C) % LCG_M
}

function rollWithLcg(sides: number, state: [number]): number {
  state[0] = lcgNext(state[0])
  return (state[0] % sides) + 1
}

function generateSeed(): string {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0]!.toString(16).padStart(8, '0')
}

function seedToInt(seed: string): number {
  return parseInt(seed, 16) >>> 0
}

function rollFromSeed(seed: string, request: DiceRollRequest): DiceRoll {
  const state: [number] = [seedToInt(seed)]
  const actionDie = rollWithLcg(SIDES[request.action], state)
  const c1 = rollWithLcg(SIDES[request.challenge[0]], state)
  const c2 = rollWithLcg(SIDES[request.challenge[1]], state)
  return {
    request,
    actionDie,
    challengeDice: [c1, c2],
    modifier: request.modifier,
    total: actionDie + request.modifier,
    seed,
    rolledAt: new Date().toISOString(),
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface IDiceService {
  roll(request: DiceRollRequest): DiceRoll
  replay(seed: string, request: DiceRollRequest): DiceRoll
}

export const DiceService: IDiceService = {
  roll(request) {
    const seed = request.seed ?? generateSeed()
    return rollFromSeed(seed, request)
  },
  replay(seed, request) {
    return rollFromSeed(seed, { ...request, seed })
  },
}
