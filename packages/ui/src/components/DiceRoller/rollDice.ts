// Ironsworn dice resolution:
// Roll d6 + statValue (action score) vs two d10s (challenge dice).
// Strong hit: action score > both. Weak hit: action score > one. Miss: neither.

export type DiceOutcome = 'strong-hit' | 'weak-hit' | 'miss'

export interface DiceResult {
  /** Raw d6 face value (1–6). */
  actionDie: number
  /** actionDie + statValue. */
  actionScore: number
  /** First challenge die (1–10). */
  challengeDie1: number
  /** Second challenge die (1–10). */
  challengeDie2: number
  outcome: DiceOutcome
}

export interface RollOptions {
  /** Override the RNG for testing. Must return a value in [0, 1). */
  random?: () => number
}

export function rollDice(statValue: number, opts?: RollOptions): DiceResult {
  const rng = opts?.random ?? Math.random

  const actionDie = Math.floor(rng() * 6) + 1
  const actionScore = actionDie + statValue
  const challengeDie1 = Math.floor(rng() * 10) + 1
  const challengeDie2 = Math.floor(rng() * 10) + 1

  const beats1 = actionScore > challengeDie1
  const beats2 = actionScore > challengeDie2

  const outcome: DiceOutcome =
    beats1 && beats2 ? 'strong-hit' : beats1 || beats2 ? 'weak-hit' : 'miss'

  return { actionDie, actionScore, challengeDie1, challengeDie2, outcome }
}
