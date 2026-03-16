// IronswornPlugin — full RulesetPlugin implementation
import type {
  RulesetPlugin,
  MoveCategory,
  AssetType,
  CharacterState,
  CharacterMutation,
  SceneContext,
} from '@saga-keeper/domain'
import { ironswornManifest } from './manifest'
import {
  IronswornCharacterData,
  IronswornDebilities,
  IRONSWORN_DEFAULTS,
} from './character/schema'
import { IRONSWORN_MOVES } from './moves/catalogue'
import { resolveMove } from './moves/resolve'
import { ORACLE_TABLES } from './oracle/tables'
import { rollOnTable, rollAskFates } from './oracle/roll'
import { IRONSWORN_ASSETS } from './assets/catalogue'

// ── Character ─────────────────────────────────────────────────────────────────

const IRONSWORN_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['edge', 'heart', 'iron', 'shadow', 'wits', 'health', 'spirit', 'supply', 'momentum', 'debilities', 'vows', 'bonds', 'assetIds', 'experience'],
  properties: {
    edge: { type: 'integer', minimum: 1, maximum: 4 },
    heart: { type: 'integer', minimum: 1, maximum: 4 },
    iron: { type: 'integer', minimum: 1, maximum: 4 },
    shadow: { type: 'integer', minimum: 1, maximum: 4 },
    wits: { type: 'integer', minimum: 1, maximum: 4 },
    health: { type: 'integer', minimum: 0, maximum: 5 },
    spirit: { type: 'integer', minimum: 0, maximum: 5 },
    supply: { type: 'integer', minimum: 0, maximum: 5 },
    momentum: { type: 'integer', minimum: -6, maximum: 10 },
    debilities: {
      type: 'object',
      properties: {
        wounded: { type: 'boolean' }, shaken: { type: 'boolean' },
        unprepared: { type: 'boolean' }, encumbered: { type: 'boolean' },
        maimed: { type: 'boolean' }, corrupted: { type: 'boolean' },
        cursed: { type: 'boolean' }, tormented: { type: 'boolean' },
        weak: { type: 'boolean' },
      },
    },
    vows: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'rank', 'progress', 'fulfilled'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          rank: { type: 'string', enum: ['troublesome', 'dangerous', 'formidable', 'extreme', 'epic'] },
          progress: { type: 'number', minimum: 0, maximum: 10 },
          fulfilled: { type: 'boolean' },
        },
      },
    },
    bonds: { type: 'array', items: { type: 'string' } },
    assetIds: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'object',
      required: ['earned', 'spent'],
      properties: {
        earned: { type: 'integer', minimum: 0 },
        spent: { type: 'integer', minimum: 0 },
      },
    },
  },
}

/** Debilities that permanently reduce momentum reset (banes + burdens) */
const PERMANENT_DEBILITIES: ReadonlyArray<keyof IronswornDebilities> = [
  'maimed', 'corrupted', 'cursed', 'tormented',
]

function countDebilities(debilities: IronswornDebilities): number {
  return (Object.values(debilities) as boolean[]).filter(Boolean).length
}

function maxMomentum(debilities: IronswornDebilities): number {
  return 10 - countDebilities(debilities)
}

function applyConditionMutation(
  state: CharacterState,
  condition: string,
  active: boolean,
): CharacterMutation {
  const data = state.data as unknown as IronswornCharacterData
  const debilities = { ...data.debilities, [condition]: active }
  const newMax = maxMomentum(debilities)
  // Clamp momentum to the new cap
  const momentum = Math.min(data.momentum, newMax)
  // Banes reduce hard limits on meters
  const health = debilities.maimed ? Math.min(data.health, 3) : data.health
  const spirit = debilities.corrupted ? Math.min(data.spirit, 3) : data.spirit
  const next: CharacterState = {
    ...state,
    data: { ...data, debilities, momentum, health, spirit },
    updatedAt: new Date().toISOString(),
  }
  const verb = active ? 'marked' : 'cleared'
  return { next, description: `Debility "${condition}" ${verb}.` }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export const ironswornPlugin: RulesetPlugin = {
  manifest: ironswornManifest,

  character: {
    schema: IRONSWORN_SCHEMA,

    defaults(): CharacterState['data'] {
      return { ...IRONSWORN_DEFAULTS }
    },

    applyCondition(state, condition, active): CharacterMutation {
      return applyConditionMutation(state, condition, active)
    },

    momentumReset(state): number {
      const data = state.data as unknown as IronswornCharacterData
      const permanentCount = PERMANENT_DEBILITIES.filter(
        (k) => data.debilities[k],
      ).length
      return Math.max(0, 2 - permanentCount)
    },

    canAdvance(state, cost): boolean {
      const data = state.data as unknown as IronswornCharacterData
      return data.experience.earned - data.experience.spent >= cost
    },
  },

  moves: {
    getAll() {
      return IRONSWORN_MOVES
    },

    getByCategory(category: MoveCategory) {
      return IRONSWORN_MOVES.filter((m) => m.category === category)
    },

    resolve(move, roll, state) {
      return resolveMove(move, roll, state)
    },

    suggest(context: SceneContext) {
      if (context.inCombat) {
        return IRONSWORN_MOVES.filter((m) =>
          ['strike', 'clash', 'end-the-fight', 'turn-the-tide', 'battle', 'face-death', 'face-desolation'].includes(m.id),
        )
      }
      if (context.onJourney) {
        return IRONSWORN_MOVES.filter((m) =>
          ['undertake-journey', 'face-danger', 'make-camp', 'reach-destination', 'resupply'].includes(m.id),
        )
      }
      return IRONSWORN_MOVES.filter((m) =>
        ['face-danger', 'secure-advantage', 'gather-information', 'compel', 'swear-iron-vow', 'ask-the-oracle'].includes(m.id),
      )
    },
  },

  oracle: {
    getTables() {
      return ORACLE_TABLES
    },

    roll(tableId) {
      return rollOnTable(tableId)
    },

    rollAskFates(odds) {
      return rollAskFates(odds)
    },
  },

  assets: {
    getAll() {
      return IRONSWORN_ASSETS
    },

    getByType(type: AssetType) {
      return IRONSWORN_ASSETS.filter((a) => a.type === type)
    },
  },

  creation: {
    steps: [
      {
        id: 'world-select',
        title: 'Your World',
        subtitle: 'Choose the truths that shape the Ironlands',
        component: 'world-select',
        optional: false,
        aiCounsel: 'forge.counsel',
      },
      {
        id: 'name-background',
        title: 'Who Are You?',
        subtitle: 'Your name and background set the stage',
        component: 'name-background',
        optional: false,
        aiCounsel: 'forge.counsel',
      },
      {
        id: 'stat-assignment',
        title: 'Your Stats',
        subtitle: 'Distribute [3, 2, 2, 1, 1] across Edge, Heart, Iron, Shadow, Wits',
        component: 'stat-assignment',
        optional: false,
      },
      {
        id: 'asset-picker',
        title: 'Your Assets',
        subtitle: 'Choose 3 assets that define your abilities',
        component: 'asset-picker',
        optional: false,
        aiCounsel: 'forge.counsel',
      },
      {
        id: 'vow-composer',
        title: 'Your Starting Vow',
        subtitle: 'Swear an iron vow that will drive your first adventure',
        component: 'vow-composer',
        optional: false,
        aiCounsel: 'forge.counsel',
      },
      {
        id: 'confirmation',
        title: 'Enter the Ironlands',
        subtitle: 'Review your character and begin your story',
        component: 'confirmation',
        optional: false,
      },
    ],

    statBudget: [3, 2, 2, 1, 1],

    validate(partial) {
      const errors: string[] = []
      const data = partial as unknown as Partial<IronswornCharacterData>

      // Stats must use [3, 2, 2, 1, 1] budget exactly
      const statKeys = ['edge', 'heart', 'iron', 'shadow', 'wits'] as const
      if (statKeys.every((k) => data[k] !== undefined)) {
        const total = statKeys.reduce((sum, k) => sum + (data[k] ?? 0), 0)
        if (total !== 9) {
          errors.push(`Stat total must be 9 (got ${total}). Distribute [3, 2, 2, 1, 1] across your five stats.`)
        }
        const vals = statKeys.map((k) => data[k] ?? 0).sort((a, b) => b - a)
        const budget = [3, 2, 2, 1, 1]
        if (!vals.every((v, i) => v === budget[i])) {
          errors.push('Stats must use the distribution [3, 2, 2, 1, 1] — no stat may exceed 3 or be below 1.')
        }
      }

      // Must have at least one asset
      if (data.assetIds !== undefined && data.assetIds.length < 3) {
        errors.push('You must choose 3 assets before entering the Ironlands.')
      }

      // Must have at least one vow
      if (data.vows !== undefined && data.vows.length === 0) {
        errors.push('You must swear at least one iron vow to begin your journey.')
      }

      return { valid: errors.length === 0, errors }
    },
  },
}
