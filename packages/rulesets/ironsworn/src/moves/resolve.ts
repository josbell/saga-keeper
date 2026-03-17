// Ironsworn move resolution — derives MoveOutcome from a completed DiceRoll
import type { CharacterState, DiceRoll, MoveOutcome, Move, StatDelta } from '@saga-keeper/domain'
import { IRONSWORN_STAT_RANGE, toIronswornData } from '../character/schema'
import { IRONSWORN_MOVES } from './catalogue'

type HitResult = 'strong-hit' | 'weak-hit' | 'miss'

// ── Outcome derivation ────────────────────────────────────────────────────────

/**
 * For regular moves: total = actionDie + modifier vs both challenge dice.
 * For progress moves (End the Fight, Fulfill Your Vow, etc.): the caller
 * sets DiceRoll.total to the progress track value and challengeDice are rolled normally.
 */
function hitResult(roll: DiceRoll): { result: HitResult; match: boolean } {
  const [c0, c1] = roll.challengeDice
  const match = c0 === c1
  if (roll.total > c0 && roll.total > c1) return { result: 'strong-hit', match }
  if (roll.total > c0 || roll.total > c1) return { result: 'weak-hit', match }
  return { result: 'miss', match }
}

// ── Stat clamping ─────────────────────────────────────────────────────────────

function clamp(stat: string, val: number): number {
  const range = IRONSWORN_STAT_RANGE[stat]
  if (!range) return val
  return Math.max(range[0], Math.min(range[1], val))
}

function delta(state: CharacterState, stat: string, d: number): StatDelta {
  const data = toIronswornData(state) as unknown as Record<string, number>
  const before = data[stat] ?? 0
  const after = clamp(stat, before + d)
  return { stat, before, after }
}

function deltas(state: CharacterState, specs: Array<[string, number]>): StatDelta[] {
  return specs.map(([stat, d]) => delta(state, stat, d)).filter((sd) => sd.before !== sd.after) // only include actual changes
}

// ── Per-move outcome tables ───────────────────────────────────────────────────

interface OutcomeSpec {
  deltas?: Array<[string, number]>
  hints: string[]
}

interface MoveSpec {
  'strong-hit': OutcomeSpec
  'weak-hit': OutcomeSpec
  miss: OutcomeSpec
  onMatch?: { strongHit?: string; weakHit?: string; miss?: string }
}

const MOVE_OUTCOMES: Record<string, MoveSpec> = {
  'face-danger': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You succeed. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['You succeed, but face a troublesome cost, complication, or harm.'],
    },
    miss: {
      hints: ['Your approach fails. Pay the Price.'],
    },
    onMatch: {
      strongHit: 'Your success is decisive. Take an additional +1 momentum.',
      miss: 'Your failure opens a dire complication.',
    },
  },

  'secure-advantage': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You gain the upper hand. +2 momentum.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: ['Your advantage is modest. +1 momentum.'],
    },
    miss: {
      hints: ['Your attempt to gain leverage backfires. Pay the Price.'],
    },
  },

  'gather-information': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You uncover a vital clue or truth. +2 momentum.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: [
        'You find something useful, but your investigation reveals new complications. +1 momentum.',
      ],
    },
    miss: {
      hints: ['Your investigation leads you into danger or deeper confusion. Pay the Price.'],
    },
  },

  heal: {
    'strong-hit': {
      deltas: [['health', 2]],
      hints: ['Wounds are mended. +2 health.'],
    },
    'weak-hit': {
      deltas: [
        ['health', 2],
        ['supply', -1],
      ],
      hints: ['You recover, but treatment costs supplies. +2 health, -1 supply.'],
    },
    miss: {
      hints: ['Your attempt to heal worsens the situation. Pay the Price.'],
    },
  },

  resupply: {
    'strong-hit': {
      deltas: [['supply', 2]],
      hints: ['Your hunt or forage yields rich bounty. +2 supply.'],
    },
    'weak-hit': {
      deltas: [['supply', 1]],
      hints: ['You find something, but it is meager. +1 supply.'],
    },
    miss: {
      hints: ['You return empty-handed — or worse. Pay the Price.'],
    },
  },

  'make-camp': {
    'strong-hit': {
      hints: ['You rest well. Choose two: +1 health, +1 spirit, +1 supply, or +1 momentum.'],
    },
    'weak-hit': {
      hints: [
        'You rest enough to continue. Choose one: +1 health, +1 spirit, +1 supply, or +1 momentum.',
      ],
    },
    miss: {
      deltas: [['supply', -1]],
      hints: ['Your rest is interrupted. -1 supply. Pay the Price.'],
    },
  },

  'undertake-journey': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['Mark progress on your journey. The path is favorable. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['Mark progress on your journey, but the cost is steep — supply, harm, or lost time.'],
    },
    miss: {
      deltas: [['health', -1]],
      hints: ['You are beset by hardship. Mark no progress. -1 health. Pay the Price.'],
    },
  },

  'reach-destination': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You arrive at your destination in good stead. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['You reach your destination, but the journey has taken its toll.'],
    },
    miss: {
      hints: ['You have gone astray, or arrived somewhere unexpected. Pay the Price.'],
    },
  },

  'aid-your-ally': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['Your ally may add +2 on their next move. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['Your ally may add +1 on their next move.'],
    },
    miss: {
      hints: ['Your assistance fails. Pay the Price.'],
    },
  },

  'enter-the-fray': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You seize the initiative. +2 momentum. You have initiative.'],
    },
    'weak-hit': {
      hints: ['Combat is joined. Choose one: take +2 momentum, or take initiative.'],
    },
    miss: {
      deltas: [['momentum', -1]],
      hints: ['You are caught off-guard. Your foe has initiative. -1 momentum.'],
    },
    onMatch: {
      strongHit: 'You caught your foe utterly unprepared. Take an additional +1 momentum.',
    },
  },

  strike: {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['Strike true. Mark progress on your combat track twice. +1 momentum.'],
    },
    'weak-hit': {
      hints: [
        'You land a blow. Mark progress on your combat track. Your foe retaliates — they have initiative.',
      ],
    },
    miss: {
      hints: ['Your attack fails. Your foe has initiative. Pay the Price.'],
    },
  },

  clash: {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You turn the fight around. Mark progress twice and regain initiative. +1 momentum.'],
    },
    'weak-hit': {
      deltas: [['health', -1]],
      hints: [
        'You exchange blows. Mark progress on your combat track. -1 health. Your foe retains initiative.',
      ],
    },
    miss: {
      deltas: [['health', -2]],
      hints: ['The attack hammers through your defenses. -2 health. Pay the Price.'],
    },
  },

  'turn-the-tide': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You steal the initiative and press the advantage. +2 momentum.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: ['You wrest initiative away, but only briefly. +1 momentum.'],
    },
    miss: {
      hints: ['Your gamble fails. Pay the Price.'],
    },
  },

  'end-the-fight': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['Victory is yours. The fight is over. +2 momentum.'],
    },
    'weak-hit': {
      hints: [
        'The fight ends, but at great cost. Choose: a complication, harm, or a desperate concession.',
      ],
    },
    miss: {
      deltas: [
        ['health', -2],
        ['momentum', -1],
      ],
      hints: ['Defeat. You are overwhelmed. -2 health, -1 momentum. Pay the Price.'],
    },
  },

  battle: {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You achieve your objective. +2 momentum.'],
    },
    'weak-hit': {
      hints: [
        'You succeed at great cost. Suffer -2 of one resource: health, spirit, or supply (your choice).',
      ],
    },
    miss: {
      deltas: [
        ['health', -2],
        ['spirit', -1],
      ],
      hints: ['The battle turns against you. -2 health, -1 spirit. Pay the Price.'],
    },
  },

  'face-death': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['Death rejects you. You are cast back into the mortal world. +1 momentum.'],
    },
    'weak-hit': {
      hints: [
        'You survive, barely. You are deeply marked by the experience. No recovery — press on.',
      ],
    },
    miss: {
      hints: ['You are dead, or face a fate worse than death. The world beyond claims you.'],
    },
  },

  'face-desolation': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You resist the darkness. +1 momentum.'],
    },
    'weak-hit': {
      hints: [
        'You hold on. Choose: press on with no gain, or envision how this changes you and gain +1 spirit (but one Vow falters).',
      ],
    },
    miss: {
      hints: [
        'You give in to desolation. You are lost. Your Ironsworn story ends — or you become a foe.',
      ],
    },
  },

  // Not a roll — triggered when supply reaches 0. All outcomes apply the same consequence.
  'out-of-supply': {
    'strong-hit': {
      hints: [
        'Mark unprepared. While unprepared, further -supply instead triggers Endure Harm or Endure Stress.',
      ],
    },
    'weak-hit': {
      hints: [
        'Mark unprepared. While unprepared, further -supply instead triggers Endure Harm or Endure Stress.',
      ],
    },
    miss: {
      hints: [
        'Mark unprepared. While unprepared, further -supply instead triggers Endure Harm or Endure Stress.',
      ],
    },
  },

  // Not a roll — triggered when momentum is at minimum. All outcomes identical.
  'face-a-setback': {
    'strong-hit': {
      hints: ['Choose: Endure Harm, Endure Stress, or Companion Endures Harm.'],
    },
    'weak-hit': {
      hints: ['Choose: Endure Harm, Endure Stress, or Companion Endures Harm.'],
    },
    miss: {
      hints: ['Choose: Endure Harm, Endure Stress, or Companion Endures Harm.'],
    },
  },

  'endure-harm': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You pull through. Take control. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['You focus past the pain. Choose: spend 1 momentum, or mark wounded.'],
    },
    miss: {
      deltas: [['health', -1]],
      hints: ['You are overcome by harm. -1 health. If your health is now 0, roll on Face Death.'],
    },
  },

  'endure-stress': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['You resist the darkness. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['You hold yourself together. Choose: spend 1 momentum, or mark shaken.'],
    },
    miss: {
      deltas: [['spirit', -1]],
      hints: ['Despair takes hold. -1 spirit. If your spirit is now 0, roll on Face Desolation.'],
    },
  },

  compel: {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['They do what you ask. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['They will do it, but only if you meet their terms or pay a cost.'],
    },
    miss: {
      hints: ['They refuse or act against you. Pay the Price.'],
    },
  },

  sojourn: {
    'strong-hit': {
      hints: [
        'The community welcomes you. Choose two: +2 health, +2 spirit, +2 supply, or +2 momentum.',
      ],
    },
    'weak-hit': {
      hints: [
        'The community offers modest aid. Choose one: +2 health, +2 spirit, +2 supply, or +2 momentum.',
      ],
    },
    miss: {
      hints: ['The community is unable or unwilling to help. Pay the Price.'],
    },
  },

  'draw-the-circle': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You set the terms. +2 momentum. The duel will be fought fairly.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: ['The duel is accepted, but your foe sets a condition. +1 momentum.'],
    },
    miss: {
      deltas: [['momentum', -1]],
      hints: ['Your challenge is refused or met with treachery. -1 momentum. Pay the Price.'],
    },
  },

  'forge-a-bond': {
    'strong-hit': {
      hints: ['Mark progress on your bonds track.'],
    },
    'weak-hit': {
      hints: [
        'Mark progress on your bonds track. There is a complication — a test or unresolved conflict ahead.',
      ],
    },
    miss: {
      hints: ['The bond is refused or sundered. Pay the Price.'],
    },
  },

  'test-your-bond': {
    'strong-hit': {
      deltas: [['momentum', 1]],
      hints: ['The bond holds. It is stronger for being tested. +1 momentum.'],
    },
    'weak-hit': {
      hints: ['The bond survives but is strained. Expect complications going forward.'],
    },
    miss: {
      deltas: [['spirit', -1]],
      hints: [
        'The bond is broken. Endure Stress. -1 spirit. You must Forsake Your Vow if the bond was the focus of one.',
      ],
    },
  },

  'write-your-epilogue': {
    'strong-hit': {
      hints: ['Your legacy is celebrated. Your bonds and deeds echo across the Ironlands.'],
    },
    'weak-hit': {
      hints: ['You find a measure of peace, though the road behind was long and hard.'],
    },
    miss: {
      hints: ['Your fate is a bitter one. The Ironlands do not easily release their hold.'],
    },
  },

  'swear-iron-vow': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['You are resolute. +2 momentum. Your vow burns bright — begin with purpose.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: ['You swear the vow, but doubt gnaws at you. +1 momentum.'],
    },
    miss: {
      deltas: [['momentum', -1]],
      hints: [
        'You falter at the weight of this promise. -1 momentum. Your vow is marked, but begins under shadow.',
      ],
    },
    onMatch: {
      strongHit: 'Iron sings. This vow will shake the Ironlands. +1 additional momentum.',
      miss: 'A dire omen accompanies your oath.',
    },
  },

  'reach-milestone': {
    'strong-hit': {
      hints: ['Mark progress on your vow. Every step forward counts.'],
    },
    'weak-hit': {
      hints: ['Mark progress on your vow.'],
    },
    miss: {
      hints: ['No progress is made yet. A setback or complication stands in the way.'],
    },
  },

  'fulfill-your-vow': {
    'strong-hit': {
      deltas: [['momentum', 2]],
      hints: ['Your vow is fulfilled. Gain 2 experience. +2 momentum.'],
    },
    'weak-hit': {
      deltas: [['momentum', 1]],
      hints: ['Your vow is fulfilled, but at a cost. Gain 1 experience. +1 momentum.'],
    },
    miss: {
      deltas: [
        ['momentum', -1],
        ['spirit', -1],
      ],
      hints: [
        'Your vow is undone. The goal is lost or corrupted. -1 momentum, -1 spirit. Forsake Your Vow.',
      ],
    },
  },

  // Not a roll — triggered when a vow is abandoned. Always clears the vow and Endure Stress (-1 spirit).
  'forsake-your-vow': {
    'strong-hit': {
      deltas: [['spirit', -1]],
      hints: ['Clear the vow and Endure Stress. -1 spirit. If the vow was bonded, Test Your Bond.'],
    },
    'weak-hit': {
      deltas: [['spirit', -1]],
      hints: ['Clear the vow and Endure Stress. -1 spirit. If the vow was bonded, Test Your Bond.'],
    },
    miss: {
      deltas: [['spirit', -1]],
      hints: ['Clear the vow and Endure Stress. -1 spirit. If the vow was bonded, Test Your Bond.'],
    },
  },

  advance: {
    'strong-hit': {
      hints: ['Spend 3 experience. Add a new asset or upgrade an existing one.'],
    },
    'weak-hit': {
      hints: ['Spend 3 experience. Add a new asset or upgrade an existing one.'],
    },
    miss: {
      hints: ['You lack the experience needed to advance. 3 experience required.'],
    },
  },

  'pay-the-price': {
    'strong-hit': {
      hints: ['Suffer the consequence. Consult the oracle or choose the most fitting harm.'],
    },
    'weak-hit': {
      hints: ['Suffer the consequence.'],
    },
    miss: {
      hints: ['Suffer the consequence.'],
    },
  },

  'ask-the-oracle': {
    'strong-hit': {
      hints: ['The oracle speaks. Roll on the relevant table or ask a yes/no question.'],
    },
    'weak-hit': {
      hints: ['The oracle speaks.'],
    },
    miss: {
      hints: ['The oracle is silent, or its answer is cryptic.'],
    },
  },
}

// ── Generic fallback ──────────────────────────────────────────────────────────

const GENERIC_SPEC: MoveSpec = {
  'strong-hit': { hints: ['Strong hit. You succeed with advantage.'] },
  'weak-hit': { hints: ['Weak hit. You succeed, but face a complication.'] },
  miss: { hints: ['Miss. Pay the Price.'] },
}

// ── Public resolver ───────────────────────────────────────────────────────────

export function resolveMove(move: Move, roll: DiceRoll, state: CharacterState): MoveOutcome {
  const { result, match } = hitResult(roll)
  const spec = MOVE_OUTCOMES[move.id] ?? GENERIC_SPEC
  const outcomeSpec = spec[result]

  const consequences = deltas(state, outcomeSpec.deltas ?? [])
  const narrativeHints = [...outcomeSpec.hints]

  if (match && spec.onMatch) {
    const matchHint =
      result === 'strong-hit'
        ? spec.onMatch.strongHit
        : result === 'weak-hit'
          ? spec.onMatch.weakHit
          : spec.onMatch.miss
    if (matchHint) narrativeHints.push(`MATCH — ${matchHint}`)
  }

  const followUpMoves = suggestFollowUps(move.id, result)
  return {
    result,
    match,
    consequences,
    narrativeHints,
    ...(followUpMoves !== undefined && { followUpMoves }),
  }
}

// ── Follow-up move suggestions ────────────────────────────────────────────────

function byId(id: string): Move | undefined {
  return IRONSWORN_MOVES.find((m) => m.id === id)
}

function suggestFollowUps(moveId: string, result: HitResult): Move[] | undefined {
  if (result === 'miss') {
    const payThePrice = byId('pay-the-price')
    return payThePrice ? [payThePrice] : undefined
  }
  const followUps: Record<string, string[]> = {
    'swear-iron-vow': ['undertake-journey', 'ask-the-oracle'],
    'enter-the-fray': ['strike'],
    clash: ['end-the-fight', 'face-death'],
    strike: ['end-the-fight'],
    'face-danger': ['secure-advantage', 'gather-information'],
    sojourn: ['forge-a-bond'],
    'forsake-your-vow': ['endure-stress', 'test-your-bond'],
    'face-a-setback': ['endure-harm', 'endure-stress'],
    'out-of-supply': ['endure-harm', 'endure-stress'],
  }
  const ids = followUps[moveId]
  return ids?.map(byId).filter((m): m is Move => m !== undefined) ?? undefined
}
