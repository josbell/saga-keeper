import { describe, it, expect } from 'vitest'
import { NPCSchema, RandomEventSchema, parseStructuredOutput } from './index'

const VALID_NPC = {
  name: 'Kira',
  role: 'Wandering healer',
  demeanour: 'Cautious',
  secret: 'Carries a vow she has not spoken aloud',
  bond_potential: 'High — she knew your kin',
  first_words: '"The roads are not safe. You should know that."',
}

const VALID_RANDOM_EVENT = {
  trigger: 'A raven lands on your pack',
  complication: 'Its leg bears a message you did not expect',
  opportunity: 'The sender is someone who owes you a debt',
  oracle_hint: 'Darkness / Warning',
}

describe('parseStructuredOutput — NPCSchema', () => {
  it('parses valid NPC JSON', () => {
    const result = parseStructuredOutput(NPCSchema, JSON.stringify(VALID_NPC))
    expect(result).toEqual(VALID_NPC)
  })

  it('throws on invalid JSON string', () => {
    expect(() => parseStructuredOutput(NPCSchema, 'not json')).toThrow('not valid JSON')
  })

  it('throws when schema fields are missing', () => {
    const partial = { name: 'Kira' }
    expect(() => parseStructuredOutput(NPCSchema, JSON.stringify(partial))).toThrow(
      'did not match expected schema'
    )
  })

  it('throws when a required field is empty string', () => {
    const bad = { ...VALID_NPC, role: '' }
    expect(() => parseStructuredOutput(NPCSchema, JSON.stringify(bad))).toThrow(
      'did not match expected schema'
    )
  })
})

describe('parseStructuredOutput — RandomEventSchema', () => {
  it('parses valid RandomEvent JSON', () => {
    const result = parseStructuredOutput(RandomEventSchema, JSON.stringify(VALID_RANDOM_EVENT))
    expect(result).toEqual(VALID_RANDOM_EVENT)
  })

  it('throws on missing oracle_hint', () => {
    const bad = { trigger: 'x', complication: 'x', opportunity: 'x' }
    expect(() => parseStructuredOutput(RandomEventSchema, JSON.stringify(bad))).toThrow(
      'did not match expected schema'
    )
  })
})

describe('parseStructuredOutput — generic', () => {
  it('works with any ZodType — z.string()', async () => {
    const { z } = await import('zod')
    const result = parseStructuredOutput(z.string(), JSON.stringify('hello'))
    expect(result).toBe('hello')
  })

  it('error message includes the raw response', () => {
    const raw = 'garbage'
    try {
      parseStructuredOutput(NPCSchema, raw)
    } catch (e) {
      expect((e as Error).message).toContain(raw)
    }
  })
})
