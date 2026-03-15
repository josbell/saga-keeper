// ── Ruleset plugin interface ───────────────────────────────────────────────────
// The contract every game plugin must implement.
// Adding a new TTRPG = implementing this interface. Nothing else changes.

import type { CharacterState, CharacterMutation } from './character'
import type { DiceRoll } from './dice'
import type { OracleTable, OracleRoll, FatesResult, Odds } from './oracle'

export type RulesetFeature =
  | 'vows'
  | 'assets'
  | 'oracle-tables'
  | 'world-truths'
  | 'sectors'
  | 'legacy-tracks'

export interface RulesetManifest {
  id: string
  displayName: string
  version: string
  author: string
  playerCount: { min: number; max: number }
  features: RulesetFeature[]
}

// ── Move types ────────────────────────────────────────────────────────────────

export type MoveCategory =
  | 'adventure'
  | 'combat'
  | 'relationship'
  | 'quest'
  | 'fate'
  | 'legacy'

export interface Move {
  id: string
  name: string
  category: MoveCategory
  /** Which stat(s) can be used for this move */
  stats: string[]
  description: string
  /** Short trigger text shown in quick-move pills */
  trigger: string
}

export interface MoveOutcome {
  result: 'strong-hit' | 'weak-hit' | 'miss'
  match: boolean
  consequences: import('./character').StatDelta[]
  /** Injected into Skald system prompt context */
  narrativeHints: string[]
  followUpMoves?: Move[]
}

// ── Creation step types ───────────────────────────────────────────────────────

export type CreationStepComponent =
  | 'world-select'
  | 'name-background'
  | 'stat-assignment'
  | 'asset-picker'
  | 'vow-composer'
  | 'confirmation'

export interface CreationStep {
  id: string
  title: string
  subtitle: string
  component: CreationStepComponent
  optional: boolean
  /** AIIntent to fire for Skald's Counsel on this step */
  aiCounsel?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ── Asset types ───────────────────────────────────────────────────────────────

export type AssetType = 'companion' | 'path' | 'combat-talent' | 'ritual' | 'custom'

export interface Asset {
  id: string
  name: string
  type: AssetType
  description: string
  abilities: string[]
}

// ── The full plugin interface ─────────────────────────────────────────────────

export interface RulesetPlugin {
  manifest: RulesetManifest

  character: {
    /** JSON Schema for character data — validated on load/save */
    schema: Record<string, unknown>
    defaults(): CharacterState['data']
    applyCondition(
      state: CharacterState,
      condition: string,
      active: boolean
    ): CharacterMutation
    momentumReset(state: CharacterState): number
    canAdvance(state: CharacterState, cost: number): boolean
  }

  moves: {
    getAll(): Move[]
    getByCategory(category: MoveCategory): Move[]
    resolve(move: Move, roll: DiceRoll, state: CharacterState): MoveOutcome
    /** Context-aware suggestions for the Skald input bar */
    suggest(context: SceneContext): Move[]
  }

  oracle: {
    getTables(): OracleTable[]
    roll(tableId: string): OracleRoll
    rollAskFates(odds: Odds): FatesResult
  }

  assets: {
    getAll(): Asset[]
    getByType(type: AssetType): Asset[]
  }

  creation: {
    steps: CreationStep[]
    /** Stat distribution budget e.g. [3, 2, 2, 1, 1] for Ironsworn */
    statBudget: number[]
    validate(partial: Partial<CharacterState['data']>): ValidationResult
  }
}

export interface SceneContext {
  characterState: CharacterState
  recentMoves: Move[]
  inCombat: boolean
  onJourney: boolean
}
