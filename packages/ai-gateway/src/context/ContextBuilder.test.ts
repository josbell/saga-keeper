import { describe, it, expect, vi } from 'vitest'
import { ContextBuilder } from './ContextBuilder'
import type { IPromptTemplate } from '../templates/PromptTemplate'
import type { GameContext, CharacterSnapshot, SessionEvent, WorldEntity } from '@saga-keeper/domain'

function makeTemplate(): IPromptTemplate & { render: ReturnType<typeof vi.fn> } {
  return { render: vi.fn().mockReturnValue('RENDERED') }
}

function capturedContext(t: { render: ReturnType<typeof vi.fn> }): GameContext {
  return t.render.mock.calls[0]![2] as GameContext
}

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

function makeEvent(id: string): SessionEvent {
  return {
    id,
    campaignId: 'camp-1',
    turnId: 'turn-1',
    type: 'player.input',
    playerId: 'local',
    payload: { text: `event-${id}` },
    timestamp: '2026-01-01T00:00:00Z',
  }
}

function makeEntity(id: string): WorldEntity {
  return {
    id,
    campaignId: 'camp-1',
    type: 'npc',
    name: `Entity-${id}`,
    description: 'A person',
    attributes: {},
    connections: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

describe('ContextBuilder.build — delegation', () => {
  it('calls template.render with the rulesetId from context', () => {
    const t = makeTemplate()
    new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)
    expect(t.render).toHaveBeenCalledWith('ironsworn-v1', 'skald.narrate', expect.any(Object))
  })

  it('calls template.render with the correct intent', () => {
    const t = makeTemplate()
    new ContextBuilder(t).build('oracle.narrate', MINIMAL_CONTEXT)
    expect(t.render).toHaveBeenCalledWith(expect.any(String), 'oracle.narrate', expect.any(Object))
  })

  it('returns the string produced by template.render', () => {
    const t = makeTemplate()
    const result = new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)
    expect(result).toBe('RENDERED')
  })

  it('calls template.render exactly once', () => {
    const t = makeTemplate()
    new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)
    expect(t.render).toHaveBeenCalledTimes(1)
  })
})

describe('ContextBuilder.build — passthrough when under budget', () => {
  it('passes all recentEvents unchanged when under budget', () => {
    const t = makeTemplate()
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      recentEvents: [makeEvent('1'), makeEvent('2')],
    }
    new ContextBuilder(t).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.recentEvents).toHaveLength(2)
  })

  it('passes all world.entities unchanged when under budget', () => {
    const t = makeTemplate()
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities: [makeEntity('1'), makeEntity('2')], totalEntityCount: 2 },
    }
    new ContextBuilder(t).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.world.entities).toHaveLength(2)
  })
})

describe('ContextBuilder.build — recentEvents trimming', () => {
  it('drops oldest events first — newest event survives when budget allows', () => {
    const t = makeTemplate()
    // Use a large payload (~400 chars/event when serialised) so budget maths is predictable.
    // maxTokens: 500 → 2000 chars; boilerplate reserve = 800; remaining = 1200;
    // eventBudget = 720 chars — fits 1 event (~400 chars) but not 3 (~1200 chars).
    const largePayload = { text: 'x'.repeat(200) }
    const events = [
      { ...makeEvent('oldest'), payload: largePayload },
      { ...makeEvent('middle'), payload: largePayload },
      { ...makeEvent('newest'), payload: largePayload },
    ]
    const ctx: GameContext = { ...MINIMAL_CONTEXT, recentEvents: events }
    new ContextBuilder(t, { maxTokens: 500 }).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.recentEvents.length).toBeGreaterThan(0)
    expect(passedCtx.recentEvents[passedCtx.recentEvents.length - 1]!.id).toBe('newest')
    expect(passedCtx.recentEvents.length).toBeLessThan(events.length)
  })

  it('template.render is called exactly once after trimming', () => {
    const t = makeTemplate()
    const events = Array.from({ length: 50 }, (_, i) => makeEvent(String(i)))
    const ctx: GameContext = { ...MINIMAL_CONTEXT, recentEvents: events }
    new ContextBuilder(t, { maxTokens: 10 }).build('skald.narrate', ctx)
    expect(t.render).toHaveBeenCalledTimes(1)
  })
})

describe('ContextBuilder.build — world entity trimming', () => {
  it('preserves world.totalEntityCount even when entities are trimmed', () => {
    const t = makeTemplate()
    const entities = Array.from({ length: 20 }, (_, i) => makeEntity(String(i)))
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities, totalEntityCount: 20 },
    }
    new ContextBuilder(t, { maxTokens: 5 }).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.world.totalEntityCount).toBe(20)
    expect(passedCtx.world.entities.length).toBeLessThan(20)
  })
})

describe('ContextBuilder.build — edge cases', () => {
  it('no error with empty recentEvents', () => {
    const t = makeTemplate()
    expect(() => new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })

  it('no error with empty world.entities', () => {
    const t = makeTemplate()
    expect(() => new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })

  it('no error with maxTokens: 0', () => {
    const t = makeTemplate()
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      recentEvents: [makeEvent('1')],
      world: { entities: [makeEntity('1')], totalEntityCount: 1 },
    }
    expect(() => new ContextBuilder(t, { maxTokens: 0 }).build('skald.narrate', ctx)).not.toThrow()
    const passedCtx = capturedContext(t)
    expect(passedCtx.recentEvents).toEqual([])
    expect(passedCtx.world.entities).toEqual([])
  })

  it('excludes entities with empty names from context', () => {
    const t = makeTemplate()
    const emptyName: WorldEntity = { ...makeEntity('x'), name: '' }
    const whitespace: WorldEntity = { ...makeEntity('y'), name: '   ' }
    const valid = makeEntity('z')
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      world: { entities: [emptyName, whitespace, valid], totalEntityCount: 3 },
    }
    new ContextBuilder(t).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.world.entities).toHaveLength(1)
    expect(passedCtx.world.entities[0]!.id).toBe('z')
    // true total preserved regardless
    expect(passedCtx.world.totalEntityCount).toBe(3)
  })

  it('no error with very large maxTokens — nothing trimmed', () => {
    const t = makeTemplate()
    const ctx: GameContext = {
      ...MINIMAL_CONTEXT,
      recentEvents: [makeEvent('1'), makeEvent('2')],
      world: { entities: [makeEntity('1')], totalEntityCount: 1 },
    }
    new ContextBuilder(t, { maxTokens: 1_000_000 }).build('skald.narrate', ctx)
    const passedCtx = capturedContext(t)
    expect(passedCtx.recentEvents).toHaveLength(2)
    expect(passedCtx.world.entities).toHaveLength(1)
  })
})

describe('ContextBuilder.build — default options', () => {
  it('constructs with no opts without throwing', () => {
    const t = makeTemplate()
    expect(() => new ContextBuilder(t)).not.toThrow()
  })

  it('build works with default opts', () => {
    const t = makeTemplate()
    expect(() => new ContextBuilder(t).build('skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})
