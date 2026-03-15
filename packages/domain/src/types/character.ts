// ── Character domain types ────────────────────────────────────────────────────
// Ruleset-agnostic base. Each RulesetPlugin extends CharacterState with
// game-specific fields (stats, meters, debilities, etc.)

export interface CharacterState {
  id: string
  campaignId: string
  name: string
  /** Short descriptor shown under the name */
  epithet?: string
  portraitUrl?: string
  /** The plugin that owns this character's schema */
  rulesetId: string
  /** Ruleset-specific fields live here, validated against plugin JSON schema */
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CharacterSnapshot {
  id: string
  name: string
  rulesetId: string
  /** Condensed stat summary for AI context — format defined by plugin */
  summary: string
  data: Record<string, unknown>
}

export interface CharacterMutation {
  /** Next character state after applying the mutation */
  next: CharacterState
  /** Human-readable description of what changed (for session log) */
  description: string
}

export interface StatDelta {
  stat: string
  before: number
  after: number
}
