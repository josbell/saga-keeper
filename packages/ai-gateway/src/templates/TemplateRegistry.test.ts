import { describe, it, expect, vi } from 'vitest'
import { TemplateRegistry } from './TemplateRegistry'
import { IronswornPromptTemplate } from './ironsworn/IronswornPromptTemplate'
import type { IPromptTemplate } from './PromptTemplate'
import type { GameContext, CharacterSnapshot } from '@saga-keeper/domain'

function makeTemplate(marker: string): IPromptTemplate & { render: ReturnType<typeof vi.fn> } {
  return { render: vi.fn().mockReturnValue(marker) }
}

const MINIMAL_CONTEXT: GameContext = {
  rulesetId: 'ironsworn-v1',
  characters: [
    {
      id: 'char-1',
      name: 'Aldric',
      rulesetId: 'ironsworn-v1',
      summary: 'Edge:2',
      data: {},
    } satisfies CharacterSnapshot,
  ],
  world: { entities: [], totalEntityCount: 0 },
  recentEvents: [],
  oracleHistory: [],
}

describe('TemplateRegistry.register + resolve', () => {
  it('returns registered template for known rulesetId', () => {
    const t = makeTemplate('ironsworn-result')
    const registry = new TemplateRegistry()
    registry.register('ironsworn-v1', t)
    expect(registry.resolve('ironsworn-v1', 'skald.narrate')).toBe(t)
  })

  it('returns fallback (renders empty string) for unknown rulesetId', () => {
    const registry = new TemplateRegistry()
    const result = registry
      .resolve('unknown-ruleset', 'skald.narrate')
      .render('unknown-ruleset', 'skald.narrate', MINIMAL_CONTEXT)
    expect(result).toBe('')
  })

  it('re-registering same rulesetId overwrites previous', () => {
    const first = makeTemplate('first')
    const second = makeTemplate('second')
    const registry = new TemplateRegistry()
    registry.register('ironsworn-v1', first)
    registry.register('ironsworn-v1', second)
    expect(registry.resolve('ironsworn-v1', 'skald.narrate')).toBe(second)
  })

  it('lookup is case-sensitive', () => {
    const t = makeTemplate('x')
    const registry = new TemplateRegistry()
    registry.register('ironsworn-v1', t)
    const resolved = registry.resolve('Ironsworn-v1', 'skald.narrate')
    // Should return fallback, not t
    expect(resolved).not.toBe(t)
    expect(resolved.render('Ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).toBe('')
  })
})

describe('TemplateRegistry — constructor pre-registration', () => {
  it('templates passed to constructor are immediately resolvable', () => {
    const t = makeTemplate('pre-registered')
    const registry = new TemplateRegistry([{ rulesetId: 'ironsworn-v1', template: t }])
    expect(registry.resolve('ironsworn-v1', 'skald.narrate')).toBe(t)
  })

  it('multiple templates in constructor are all registered', () => {
    const t1 = makeTemplate('ruleset-a')
    const t2 = makeTemplate('ruleset-b')
    const registry = new TemplateRegistry([
      { rulesetId: 'ruleset-a', template: t1 },
      { rulesetId: 'ruleset-b', template: t2 },
    ])
    expect(registry.resolve('ruleset-a', 'skald.narrate')).toBe(t1)
    expect(registry.resolve('ruleset-b', 'skald.narrate')).toBe(t2)
  })
})

describe('TemplateRegistry — integration with IronswornPromptTemplate', () => {
  it('resolves IronswornPromptTemplate for ironsworn-v1', () => {
    const ironsworn = new IronswornPromptTemplate()
    const registry = new TemplateRegistry([{ rulesetId: 'ironsworn-v1', template: ironsworn }])
    expect(registry.resolve('ironsworn-v1', 'skald.narrate')).toBe(ironsworn)
  })

  it('render does not throw for a valid intent + context', () => {
    const ironsworn = new IronswornPromptTemplate()
    const registry = new TemplateRegistry([{ rulesetId: 'ironsworn-v1', template: ironsworn }])
    const resolved = registry.resolve('ironsworn-v1', 'skald.narrate')
    expect(() => resolved.render('ironsworn-v1', 'skald.narrate', MINIMAL_CONTEXT)).not.toThrow()
  })
})
