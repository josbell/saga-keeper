import { describe, it, expect } from 'vitest'
import { ironswornPlugin } from './IronswornPlugin'
import { IRONSWORN_MOVES } from './moves/catalogue'
import { ORACLE_TABLES } from './oracle/tables'
import { IRONSWORN_ASSETS } from './assets/catalogue'
import { rollAskFates } from './oracle/roll'
import type { CharacterState, DiceRoll } from '@saga-keeper/domain'
import type { IronswornCharacterData } from './character/schema'
import { IRONSWORN_DEFAULTS } from './character/schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<IronswornCharacterData> = {}): CharacterState {
  return {
    id: 'test-char',
    campaignId: 'test-campaign',
    name: 'Aldric',
    rulesetId: 'ironsworn-v1',
    data: { ...IRONSWORN_DEFAULTS, ...overrides },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

function makeRoll(total: number, c0: number, c1: number): DiceRoll {
  return {
    request: { action: 'd6', challenge: ['d10', 'd10'], modifier: 0 },
    actionDie: total,
    challengeDice: [c0, c1],
    modifier: 0,
    total,
    seed: 'deadbeef',
    rolledAt: '2026-01-01T00:00:00Z',
  }
}

// ── Manifest ──────────────────────────────────────────────────────────────────

describe('ironswornPlugin.manifest', () => {
  it('has the correct ruleset id', () => {
    expect(ironswornPlugin.manifest.id).toBe('ironsworn-v1')
  })

  it('supports 1-2 players', () => {
    expect(ironswornPlugin.manifest.playerCount).toEqual({ min: 1, max: 2 })
  })

  it('declares vows and assets features', () => {
    expect(ironswornPlugin.manifest.features).toContain('vows')
    expect(ironswornPlugin.manifest.features).toContain('assets')
  })
})

// ── Character ─────────────────────────────────────────────────────────────────

describe('ironswornPlugin.character.defaults', () => {
  it('returns valid default character data', () => {
    const defaults = ironswornPlugin.character.defaults()
    const d = defaults as unknown as IronswornCharacterData
    expect(d.health).toBe(5)
    expect(d.spirit).toBe(5)
    expect(d.supply).toBe(5)
    expect(d.momentum).toBe(2)
  })

  it('all debilities default to false', () => {
    const defaults = ironswornPlugin.character.defaults()
    const d = defaults as unknown as IronswornCharacterData
    expect(Object.values(d.debilities).every((v) => v === false)).toBe(true)
  })
})

describe('ironswornPlugin.character.applyCondition', () => {
  it('marks a debility as active', () => {
    const state = makeState()
    const { next } = ironswornPlugin.character.applyCondition(state, 'wounded', true)
    const data = next.data as unknown as IronswornCharacterData
    expect(data.debilities.wounded).toBe(true)
  })

  it('clears a debility', () => {
    const state = makeState({ debilities: { ...IRONSWORN_DEFAULTS.debilities, wounded: true } })
    const { next } = ironswornPlugin.character.applyCondition(state, 'wounded', false)
    const data = next.data as unknown as IronswornCharacterData
    expect(data.debilities.wounded).toBe(false)
  })

  it('reduces max momentum by 1 per debility', () => {
    const state = makeState()
    // Fresh state has momentum 2, marking wounded should not lower it (2 < 10-1=9)
    const { next } = ironswornPlugin.character.applyCondition(state, 'wounded', true)
    const data = next.data as unknown as IronswornCharacterData
    // Momentum should be unchanged (2 ≤ 9)
    expect(data.momentum).toBe(2)
  })

  it('clamps momentum to new max when many debilities are marked', () => {
    const state = makeState({ momentum: 10 })
    // Mark 6 debilities to bring max down to 4 (10-6=4)
    let current = state
    const conditions = ['wounded', 'shaken', 'unprepared', 'encumbered', 'maimed', 'corrupted']
    for (const c of conditions) {
      const { next } = ironswornPlugin.character.applyCondition(current, c, true)
      current = next
    }
    const data = current.data as unknown as IronswornCharacterData
    expect(data.momentum).toBeLessThanOrEqual(4)
  })

  it('maimed reduces max health to 3', () => {
    const state = makeState({ health: 5 })
    const { next } = ironswornPlugin.character.applyCondition(state, 'maimed', true)
    const data = next.data as unknown as IronswornCharacterData
    expect(data.health).toBe(3)
  })

  it('corrupted reduces max spirit to 3', () => {
    const state = makeState({ spirit: 5 })
    const { next } = ironswornPlugin.character.applyCondition(state, 'corrupted', true)
    const data = next.data as unknown as IronswornCharacterData
    expect(data.spirit).toBe(3)
  })
})

describe('ironswornPlugin.character.momentumReset', () => {
  it('returns 2 with no debilities', () => {
    const state = makeState()
    expect(ironswornPlugin.character.momentumReset(state)).toBe(2)
  })

  it('returns 1 with one permanent debility (maimed)', () => {
    const state = makeState({ debilities: { ...IRONSWORN_DEFAULTS.debilities, maimed: true } })
    expect(ironswornPlugin.character.momentumReset(state)).toBe(1)
  })

  it('returns 0 with two permanent debilities', () => {
    const state = makeState({
      debilities: { ...IRONSWORN_DEFAULTS.debilities, maimed: true, corrupted: true },
    })
    expect(ironswornPlugin.character.momentumReset(state)).toBe(0)
  })

  it('temporary debilities (wounded) do not affect momentum reset', () => {
    const state = makeState({ debilities: { ...IRONSWORN_DEFAULTS.debilities, wounded: true } })
    expect(ironswornPlugin.character.momentumReset(state)).toBe(2)
  })
})

describe('ironswornPlugin.character.canAdvance', () => {
  it('returns true when unspent experience covers the cost', () => {
    const state = makeState({ experience: { earned: 5, spent: 2 } })
    expect(ironswornPlugin.character.canAdvance(state, 3)).toBe(true)
  })

  it('returns false when unspent experience is insufficient', () => {
    const state = makeState({ experience: { earned: 5, spent: 4 } })
    expect(ironswornPlugin.character.canAdvance(state, 3)).toBe(false)
  })

  it('returns true for exact match', () => {
    const state = makeState({ experience: { earned: 3, spent: 0 } })
    expect(ironswornPlugin.character.canAdvance(state, 3)).toBe(true)
  })
})

// ── Moves ─────────────────────────────────────────────────────────────────────

describe('ironswornPlugin.moves.getAll', () => {
  it('returns 32 moves', () => {
    expect(ironswornPlugin.moves.getAll()).toHaveLength(32)
  })

  it('includes face-danger and swear-iron-vow', () => {
    const ids = ironswornPlugin.moves.getAll().map((m) => m.id)
    expect(ids).toContain('face-danger')
    expect(ids).toContain('swear-iron-vow')
    expect(ids).toContain('pay-the-price')
    expect(ids).toContain('ask-the-oracle')
  })
})

describe('ironswornPlugin.moves.getByCategory', () => {
  it('returns only combat moves for "combat"', () => {
    const moves = ironswornPlugin.moves.getByCategory('combat')
    expect(moves.every((m) => m.category === 'combat')).toBe(true)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('includes fate moves for "fate"', () => {
    const moves = ironswornPlugin.moves.getByCategory('fate')
    const ids = moves.map((m) => m.id)
    expect(ids).toContain('pay-the-price')
    expect(ids).toContain('ask-the-oracle')
  })

  it('all 5 categories are represented', () => {
    const categories = ['adventure', 'combat', 'relationship', 'quest', 'fate'] as const
    for (const cat of categories) {
      expect(ironswornPlugin.moves.getByCategory(cat).length).toBeGreaterThan(0)
    }
  })
})

describe('ironswornPlugin.moves.resolve', () => {
  const state = makeState()
  const faceDanger = IRONSWORN_MOVES.find((m) => m.id === 'face-danger')!

  it('strong hit: total beats both challenge dice', () => {
    const roll = makeRoll(10, 3, 5) // 10 > 3 and 10 > 5
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.result).toBe('strong-hit')
    expect(outcome.match).toBe(false)
  })

  it('weak hit: total beats one challenge die', () => {
    const roll = makeRoll(5, 3, 8) // 5 > 3, 5 < 8
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.result).toBe('weak-hit')
  })

  it('miss: total beats neither challenge die', () => {
    const roll = makeRoll(2, 5, 7) // 2 < 5 and 2 < 7
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.result).toBe('miss')
  })

  it('detects match when both challenge dice are equal', () => {
    const roll = makeRoll(5, 6, 6) // match!
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.match).toBe(true)
  })

  it('face-danger strong hit grants +1 momentum', () => {
    const roll = makeRoll(9, 2, 3)
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.result).toBe('strong-hit')
    const momentumDelta = outcome.consequences.find((c) => c.stat === 'momentum')
    expect(momentumDelta).toBeDefined()
    expect(momentumDelta!.after).toBe(3) // 2 + 1
  })

  it('miss returns narrativeHints with Pay the Price language', () => {
    const roll = makeRoll(1, 8, 9)
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.result).toBe('miss')
    expect(outcome.narrativeHints.some((h) => /pay the price/i.test(h))).toBe(true)
  })

  it('match on strong hit appends a MATCH hint', () => {
    const roll = makeRoll(9, 3, 3) // match, strong hit
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, makeState({ momentum: 2 }))
    expect(outcome.match).toBe(true)
    expect(outcome.narrativeHints.some((h) => h.toUpperCase().includes('MATCH'))).toBe(true)
  })

  it('miss on face-danger suggests follow-up move pay-the-price', () => {
    const roll = makeRoll(1, 8, 9)
    const outcome = ironswornPlugin.moves.resolve(faceDanger, roll, state)
    expect(outcome.followUpMoves?.some((m) => m.id === 'pay-the-price')).toBe(true)
  })

  it('heal strong hit restores +2 health', () => {
    const heal = IRONSWORN_MOVES.find((m) => m.id === 'heal')!
    const roll = makeRoll(9, 2, 3)
    const lowState = makeState({ health: 2 })
    const outcome = ironswornPlugin.moves.resolve(heal, roll, lowState)
    const healthDelta = outcome.consequences.find((c) => c.stat === 'health')
    expect(healthDelta?.after).toBe(4) // 2 + 2
  })

  it('health is clamped to 5 max', () => {
    const heal = IRONSWORN_MOVES.find((m) => m.id === 'heal')!
    const roll = makeRoll(9, 2, 3)
    const fullState = makeState({ health: 5 }) // already full
    const outcome = ironswornPlugin.moves.resolve(heal, roll, fullState)
    // No consequence emitted when there is no actual change
    const healthDelta = outcome.consequences.find((c) => c.stat === 'health')
    expect(healthDelta).toBeUndefined()
  })

  it('generic fallback handles an unknown move id gracefully', () => {
    const unknownMove = { id: 'unknown-custom-move', name: 'Custom', category: 'adventure' as const, stats: [], description: '', trigger: '' }
    const roll = makeRoll(9, 2, 3)
    const outcome = ironswornPlugin.moves.resolve(unknownMove, roll, state)
    expect(outcome.result).toBe('strong-hit')
    expect(outcome.narrativeHints.length).toBeGreaterThan(0)
  })
})

describe('ironswornPlugin.moves.suggest', () => {
  const base = makeState()

  it('suggests combat moves when inCombat', () => {
    const suggestions = ironswornPlugin.moves.suggest({ characterState: base, recentMoves: [], inCombat: true, onJourney: false })
    expect(suggestions.some((m) => m.id === 'strike')).toBe(true)
    expect(suggestions.some((m) => m.id === 'clash')).toBe(true)
  })

  it('suggests journey moves when onJourney', () => {
    const suggestions = ironswornPlugin.moves.suggest({ characterState: base, recentMoves: [], inCombat: false, onJourney: true })
    expect(suggestions.some((m) => m.id === 'undertake-journey')).toBe(true)
    expect(suggestions.some((m) => m.id === 'make-camp')).toBe(true)
  })

  it('suggests general moves in default scene', () => {
    const suggestions = ironswornPlugin.moves.suggest({ characterState: base, recentMoves: [], inCombat: false, onJourney: false })
    expect(suggestions.some((m) => m.id === 'face-danger')).toBe(true)
    expect(suggestions.some((m) => m.id === 'ask-the-oracle')).toBe(true)
  })
})

// ── Oracle ────────────────────────────────────────────────────────────────────

describe('ironswornPlugin.oracle.getTables', () => {
  it('returns at least 10 tables', () => {
    expect(ironswornPlugin.oracle.getTables().length).toBeGreaterThanOrEqual(10)
  })

  it('includes action, theme, pay-the-price, and npc-role tables', () => {
    const ids = ironswornPlugin.oracle.getTables().map((t) => t.id)
    expect(ids).toContain('action')
    expect(ids).toContain('theme')
    expect(ids).toContain('pay-the-price')
    expect(ids).toContain('npc-role')
  })

  it('all table entries have correct rulesetId', () => {
    for (const table of ironswornPlugin.oracle.getTables()) {
      expect(table.rulesetId).toBe('ironsworn-v1')
    }
  })
})

describe('action oracle table coverage', () => {
  it('has exactly 100 entries (one per d100 face)', () => {
    const table = ORACLE_TABLES.find((t) => t.id === 'action')!
    expect(table.entries).toHaveLength(100)
  })

  it('entries span 1–100 without gaps', () => {
    const table = ORACLE_TABLES.find((t) => t.id === 'action')!
    for (let i = 0; i < 100; i++) {
      expect(table.entries[i]!.min).toBe(i + 1)
      expect(table.entries[i]!.max).toBe(i + 1)
    }
  })

  it('theme table also has 100 entries', () => {
    const table = ORACLE_TABLES.find((t) => t.id === 'theme')!
    expect(table.entries).toHaveLength(100)
  })
})

describe('ironswornPlugin.oracle.roll', () => {
  it('returns a roll between 1 and 100', () => {
    const result = ironswornPlugin.oracle.roll('action')
    expect(result.roll).toBeGreaterThanOrEqual(1)
    expect(result.roll).toBeLessThanOrEqual(100)
  })

  it('returns a non-empty raw result string', () => {
    const result = ironswornPlugin.oracle.roll('action')
    expect(result.raw.length).toBeGreaterThan(0)
  })

  it('includes the table id', () => {
    const result = ironswornPlugin.oracle.roll('npc-role')
    expect(result.tableId).toBe('npc-role')
  })

  it('throws for an unknown table id', () => {
    expect(() => ironswornPlugin.oracle.roll('nonexistent-table')).toThrow(/Unknown oracle table/)
  })

  it('all standard tables can be rolled without error', () => {
    for (const table of ORACLE_TABLES) {
      expect(() => ironswornPlugin.oracle.roll(table.id)).not.toThrow()
    }
  })
})

describe('ironswornPlugin.oracle.rollAskFates', () => {
  it('returns a boolean result and a 1–100 roll', () => {
    const result = ironswornPlugin.oracle.rollAskFates('fifty-fifty')
    expect(typeof result.result).toBe('boolean')
    expect(result.roll).toBeGreaterThanOrEqual(1)
    expect(result.roll).toBeLessThanOrEqual(100)
  })

  it('certain odds always returns true', () => {
    // Run 20 times — certain should always be yes
    for (let i = 0; i < 20; i++) {
      expect(rollAskFates('certain').result).toBe(true)
    }
  })

  it('returns the correct odds value', () => {
    const result = ironswornPlugin.oracle.rollAskFates('unlikely')
    expect(result.odds).toBe('unlikely')
  })
})

// ── Assets ────────────────────────────────────────────────────────────────────

describe('ironswornPlugin.assets.getAll', () => {
  it('returns at least 27 assets', () => {
    expect(ironswornPlugin.assets.getAll().length).toBeGreaterThanOrEqual(27)
  })

  it('includes companions, paths, combat-talents, and rituals', () => {
    const types = new Set(ironswornPlugin.assets.getAll().map((a) => a.type))
    expect(types.has('companion')).toBe(true)
    expect(types.has('path')).toBe(true)
    expect(types.has('combat-talent')).toBe(true)
    expect(types.has('ritual')).toBe(true)
  })
})

describe('ironswornPlugin.assets.getByType', () => {
  it('returns only companions for type "companion"', () => {
    const companions = ironswornPlugin.assets.getByType('companion')
    expect(companions.every((a) => a.type === 'companion')).toBe(true)
    expect(companions.length).toBeGreaterThan(0)
  })

  it('each asset has 3 abilities', () => {
    for (const asset of IRONSWORN_ASSETS) {
      expect(asset.abilities).toHaveLength(3)
    }
  })
})

// ── Creation ──────────────────────────────────────────────────────────────────

describe('ironswornPlugin.creation.steps', () => {
  it('has exactly 6 steps', () => {
    expect(ironswornPlugin.creation.steps).toHaveLength(6)
  })

  it('steps use the expected components in order', () => {
    const components = ironswornPlugin.creation.steps.map((s) => s.component)
    expect(components).toEqual([
      'world-select',
      'name-background',
      'stat-assignment',
      'asset-picker',
      'vow-composer',
      'confirmation',
    ])
  })
})

describe('ironswornPlugin.creation.validate', () => {
  it('valid character passes', () => {
    const data: Partial<IronswornCharacterData> = {
      edge: 2, heart: 3, iron: 1, shadow: 2, wits: 1,
      assetIds: ['a', 'b', 'c'],
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'dangerous', progress: 0, fulfilled: false }],
    }
    const result = ironswornPlugin.creation.validate(data)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects stat total != 9', () => {
    const data: Partial<IronswornCharacterData> = {
      edge: 3, heart: 3, iron: 2, shadow: 2, wits: 2, // total = 12
      assetIds: ['a', 'b', 'c'],
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'dangerous', progress: 0, fulfilled: false }],
    }
    const result = ironswornPlugin.creation.validate(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('9'))).toBe(true)
  })

  it('rejects wrong stat distribution (all equal)', () => {
    const data: Partial<IronswornCharacterData> = {
      edge: 2, heart: 2, iron: 2, shadow: 2, wits: 1, // total = 9 but wrong dist
      assetIds: ['a', 'b', 'c'],
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'dangerous', progress: 0, fulfilled: false }],
    }
    const result = ironswornPlugin.creation.validate(data)
    expect(result.valid).toBe(false)
  })

  it('rejects fewer than 3 assets', () => {
    const data: Partial<IronswornCharacterData> = {
      edge: 2, heart: 3, iron: 1, shadow: 2, wits: 1,
      assetIds: ['a', 'b'], // only 2
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'dangerous', progress: 0, fulfilled: false }],
    }
    const result = ironswornPlugin.creation.validate(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('3 assets'))).toBe(true)
  })

  it('rejects missing vow', () => {
    const data: Partial<IronswornCharacterData> = {
      edge: 2, heart: 3, iron: 1, shadow: 2, wits: 1,
      assetIds: ['a', 'b', 'c'],
      vows: [],
    }
    const result = ironswornPlugin.creation.validate(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('vow'))).toBe(true)
  })
})
