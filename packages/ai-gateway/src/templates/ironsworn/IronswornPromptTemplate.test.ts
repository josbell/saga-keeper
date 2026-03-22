import { describe, it, expect } from 'vitest'
import { IronswornPromptTemplate } from './IronswornPromptTemplate'
import type { GameContext, CharacterSnapshot, WorldEntity, SessionEvent, OracleRoll } from '@saga-keeper/domain'

const CHAR: CharacterSnapshot = {
  id: 'char-1',
  name: 'Aldric',
  rulesetId: 'ironsworn-v1',
  summary: 'Edge:2 Heart:3 Iron:1 Shadow:2 Wits:1',
  data: {},
}

const MINIMAL_CONTEXT: GameContext = {
  rulesetId: 'ironsworn-v1',
  characters: [CHAR],
  world: { entities: [], totalEntityCount: 0 },
  recentEvents: [],
  oracleHistory: [],
}

function makeEntity(overrides: Partial<WorldEntity> = {}): WorldEntity {
  return {
    id: 'e-1',
    campaignId: 'camp-1',
    type: 'npc',
    name: 'Kira',
    description: 'Wandering healer',
    attributes: {},
    connections: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeEvent(id: string): SessionEvent {
  return {
    id,
    campaignId: 'camp-1',
    turnId: 'turn-1',
    type: 'player.input',
    playerId: 'local',
    payload: { text: 'I approach the hold' },
    timestamp: '2026-01-01T00:00:00Z',
  }
}

function makeOracleRoll(): OracleRoll {
  return {
    tableId: 'ask-the-fates',
    roll: 63,
    raw: 'Yes',
    timestamp: '2026-01-01T00:00:00Z',
  }
}

const template = new IronswornPromptTemplate()

describe('IronswornPromptTemplate.render — rulesetId guard', () => {
  it('throws for unknown rulesetId', () => {
    expect(() => template.render('pathfinder-v1', 'skald.narrate', MINIMAL_CONTEXT)).toThrow(
      'IronswornPromptTemplate does not support rulesetId "pathfinder-v1"'
    )
  })

  it('does not throw for ironsworn-v1', () => {
    expect(() => template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})

describe('IronswornPromptTemplate.render — intent preambles', () => {
  it('oracle.narrate contains "oracle interpreter"', () => {
    const out = template.render('ironsworn-v1', 'oracle.narrate', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toContain('oracle interpreter')
  })

  it('oracle.extract contains "extract" or "structured"', () => {
    const out = template.render('ironsworn-v1', 'oracle.extract', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toMatch(/extract|structured/)
  })

  it('skald.narrate contains "narrator" or "narrative"', () => {
    const out = template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toMatch(/narrator|narrative/)
  })

  it('skald.move contains "move"', () => {
    const out = template.render('ironsworn-v1', 'skald.move', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toContain('move')
  })

  it('world.generate contains "character generator" or "npc"', () => {
    const out = template.render('ironsworn-v1', 'world.generate', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toMatch(/character generator|npc/)
  })

  it('world.expand contains "event"', () => {
    const out = template.render('ironsworn-v1', 'world.expand', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toContain('event')
  })

  it('hall.reminder contains "scribe" or "recap"', () => {
    const out = template.render('ironsworn-v1', 'hall.reminder', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toMatch(/scribe|recap/)
  })

  it('forge.counsel contains "counsel" or "advice"', () => {
    const out = template.render('ironsworn-v1', 'forge.counsel', MINIMAL_CONTEXT)
    expect(out.toLowerCase()).toMatch(/counsel|advice/)
  })
})

describe('IronswornPromptTemplate.render — character block', () => {
  it('contains character name', () => {
    const out = template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)
    expect(out).toContain('Aldric')
  })

  it('contains character summary', () => {
    const out = template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)
    expect(out).toContain('Edge:2 Heart:3 Iron:1 Shadow:2 Wits:1')
  })

  it('lists multiple character names', () => {
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      characters: [
        CHAR,
        { id: 'char-2', name: 'Rova', rulesetId: 'ironsworn-v1', summary: 'Edge:1', data: {} },
      ],
    }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('Aldric')
    expect(out).toContain('Rova')
  })

  it('no crash with empty characters array', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, characters: [] }
    expect(() => template.render('ironsworn-v1', 'skald.narrate', ctx)).not.toThrow()
  })
})

describe('IronswornPromptTemplate.render — world block', () => {
  it('contains NPC name', () => {
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities: [makeEntity()], totalEntityCount: 1 },
    }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('Kira')
  })

  it('contains location name', () => {
    const entity = makeEntity({ type: 'location', name: 'The Iron Hold', description: 'A ruined fortress' })
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities: [entity], totalEntityCount: 1 },
    }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('The Iron Hold')
  })

  it('mentions hidden count when totalEntityCount > shown', () => {
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities: [makeEntity()], totalEntityCount: 5 },
    }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('1 of 5')
  })

  it('no crash with empty entities', () => {
    expect(() => template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})

describe('IronswornPromptTemplate.render — recent events block', () => {
  it('contains event type', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, recentEvents: [makeEvent('e-1')] }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('player.input')
  })

  it('no crash with empty recentEvents', () => {
    expect(() => template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})

describe('IronswornPromptTemplate.render — oracle history block', () => {
  it('contains oracle roll result', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, oracleHistory: [makeOracleRoll()] }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out).toContain('Yes')
  })

  it('no crash with empty oracleHistory', () => {
    expect(() => template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})

describe('IronswornPromptTemplate.render — narrative tone', () => {
  it('grim tone → output contains "grim" or "dark"', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, narrativeTone: 'grim' }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out.toLowerCase()).toMatch(/grim|dark/)
  })

  it('heroic tone → output contains "heroic" or "epic"', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, narrativeTone: 'heroic' }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out.toLowerCase()).toMatch(/heroic|epic/)
  })

  it('mythic tone → output contains "mythic"', () => {
    const ctx: GameContext = { ...MINIMAL_CONTEXT, narrativeTone: 'mythic' }
    const out = template.render('ironsworn-v1', 'skald.narrate', ctx)
    expect(out.toLowerCase()).toContain('mythic')
  })

  it('no crash when narrativeTone is absent', () => {
    expect(() => template.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})
