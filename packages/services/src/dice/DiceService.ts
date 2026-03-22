import type { DiceRoll, DiceRollRequest, DieType } from '@saga-keeper/domain'

const SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
}

// ── LCG for seeded replay ──────────────────────────────────────────────────
// Parameters from Numerical Recipes (a=1664525, c=1013904223, m=2^32).
// Deterministic: same seed always produces the same roll sequence.
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_M = 2 ** 32

function lcgNext(state: number): number {
  return (LCG_A * state + LCG_C) % LCG_M
}

/** Returns a stateful roller for a given seed.
 *  - Runs 3 warm-up iterations to avoid low-entropy clustering on small seeds.
 *  - Uses rejection sampling to eliminate modulo bias. */
function makeRoller(seed: string): (sides: number) => number {
  let state = seedToInt(seed)
  // Warm up: first few LCG outputs from low seeds cluster — discard them
  state = lcgNext(lcgNext(lcgNext(state)))
  return (sides: number) => {
    // Rejection sampling: values ≥ limit would over-represent low faces
    const limit = LCG_M - (LCG_M % sides)
    do {
      state = lcgNext(state)
    } while (state >= limit)
    return (state % sides) + 1
  }
}

function generateSeed(): string {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0]!.toString(16).padStart(8, '0')
}

function seedToInt(seed: string): number {
  if (!/^[0-9a-f]{8}$/i.test(seed)) throw new Error(`Invalid seed "${seed}": expected 8 hex chars`)
  return parseInt(seed, 16) >>> 0
}

function rollFromSeed(seed: string, request: DiceRollRequest, rolledAt?: string): DiceRoll {
  const roll = makeRoller(seed)
  const [c0, c1] = request.challenge
  const actionDie = roll(SIDES[request.action])
  const challengeDie0 = roll(SIDES[c0])
  const challengeDie1 = roll(SIDES[c1])
  return {
    request: { ...request, seed },
    actionDie,
    challengeDice: [challengeDie0, challengeDie1],
    modifier: request.modifier,
    total: actionDie + request.modifier,
    seed,
    rolledAt: rolledAt ?? new Date().toISOString(),
  }
}

// ── Outcome resolution ─────────────────────────────────────────────────────

export type HitResult = 'strong-hit' | 'weak-hit' | 'miss'

/** Pure function: derives Ironsworn hit result from a completed roll.
 *  Strong hit: total beats both challenge dice.
 *  Weak hit:   total beats exactly one.
 *  Miss:       total beats neither.
 *  Match:      both challenge dice show the same face (applies at any result). */
export function resolveOutcome(roll: DiceRoll): { result: HitResult; match: boolean } {
  const {
    total,
    challengeDice: [c0, c1],
  } = roll
  const match = c0 === c1
  if (total > c0 && total > c1) return { result: 'strong-hit', match }
  if (total > c0 || total > c1) return { result: 'weak-hit', match }
  return { result: 'miss', match }
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface IDiceService {
  roll(request: DiceRollRequest): DiceRoll
  /** Reproduce a prior roll exactly. Pass the original `rolledAt` timestamp
   *  from the stored DiceRoll for true session replay fidelity. */
  replay(seed: string, request: DiceRollRequest, rolledAt?: string): DiceRoll
}

export const DiceService: IDiceService = {
  roll(request) {
    const seed = request.seed ?? generateSeed()
    return rollFromSeed(seed, request)
  },
  replay(seed, request, rolledAt) {
    return rollFromSeed(seed, request, rolledAt)
  },
}
