import { describe, it, expect, vi } from 'vitest'
import { generateNPC } from './generateNPC'
import type { IContextBuilder } from '../context/ContextBuilder'
import type {
  ProviderAdapter,
  ProviderCapabilities,
  GameContext,
  CharacterSnapshot,
  NPCGenerationContext,
} from '@saga-keeper/domain'

const VALID_NPC_JSON = JSON.stringify({
  name: 'Kira',
  role: 'Wandering healer',
  demeanour: 'Cautious',
  secret: 'Carries a vow she has not spoken aloud',
  bond_potential: 'High — she knew your kin',
  first_words: '"The roads are not safe. You should know that."',
})

const CHAR: CharacterSnapshot = {
  id: 'char-1',
  name: 'Aldric',
  rulesetId: 'ironsworn-v1',
  summary: 'Edge:2 Heart:3 Iron:1 Shadow:2 Wits:1',
  data: {},
}

const MINIMAL_GAME_CONTEXT: GameContext = {
  rulesetId: 'ironsworn-v1',
  characters: [CHAR],
  world: { entities: [], totalEntityCount: 0 },
  recentEvents: [],
  oracleHistory: [],
}

const NPC_CONTEXT: NPCGenerationContext = {
  scene: 'A foggy river crossing at dawn',
  vow: 'Protect the village of Greymark',
}

function makeAdapter(response: string): ProviderAdapter {
  return {
    id: 'mock',
    displayName: 'Mock',
    complete: vi.fn().mockResolvedValue(response),
    stream: vi.fn(),
    getCapabilities: (): ProviderCapabilities => ({
      streaming: false,
      maxContextTokens: 100_000,
      supportsSystemPrompt: true,
      localOnly: false,
    }),
  }
}

function makeContextBuilder(): IContextBuilder & { build: ReturnType<typeof vi.fn> } {
  return { build: vi.fn().mockReturnValue('SYSTEM PROMPT') }
}

describe('generateNPC — happy path', () => {
  it('returns a validated NPC object', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    const result = await generateNPC(
      { adapter, contextBuilder: builder },
      NPC_CONTEXT,
      MINIMAL_GAME_CONTEXT
    )
    expect(result.npc).toEqual({
      name: 'Kira',
      role: 'Wandering healer',
      demeanour: 'Cautious',
      secret: 'Carries a vow she has not spoken aloud',
      bond_potential: 'High — she knew your kin',
      first_words: '"The roads are not safe. You should know that."',
    })
  })

  it('returns the raw response string', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    const result = await generateNPC(
      { adapter, contextBuilder: builder },
      NPC_CONTEXT,
      MINIMAL_GAME_CONTEXT
    )
    expect(result.raw).toBe(VALID_NPC_JSON)
  })

  it('calls contextBuilder.build with npc.generate intent', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    await generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    expect(builder.build).toHaveBeenCalledWith('npc.generate', MINIMAL_GAME_CONTEXT)
  })

  it('calls adapter.complete with system prompt and user message', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    await generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    expect(adapter.complete).toHaveBeenCalledWith(
      'SYSTEM PROMPT',
      [{ role: 'user', content: expect.stringContaining('A foggy river crossing') }],
      expect.objectContaining({ maxTokens: 512 })
    )
  })

  it('user message contains scene and vow', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    await generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    const callArgs = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]!
    const userMsg = callArgs[1][0].content as string
    expect(userMsg).toContain('A foggy river crossing')
    expect(userMsg).toContain('Protect the village of Greymark')
  })

  it('user message contains encounter when provided', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    const ctx: NPCGenerationContext = { ...NPC_CONTEXT, encounter: 'A stranger blocks the path' }
    await generateNPC({ adapter, contextBuilder: builder }, ctx, MINIMAL_GAME_CONTEXT)
    const callArgs = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]!
    const userMsg = callArgs[1][0].content as string
    expect(userMsg).toContain('A stranger blocks the path')
  })

  it('passes custom CompletionOptions to adapter', async () => {
    const adapter = makeAdapter(VALID_NPC_JSON)
    const builder = makeContextBuilder()
    await generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT, {
      temperature: 0.9,
    })
    expect(adapter.complete).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ temperature: 0.9 })
    )
  })
})

describe('generateNPC — validation', () => {
  it('throws when AI returns invalid JSON', async () => {
    const adapter = makeAdapter('not json at all')
    const builder = makeContextBuilder()
    await expect(
      generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('not valid JSON')
  })

  it('throws when AI returns JSON missing required fields', async () => {
    const partial = JSON.stringify({ name: 'Kira' })
    const adapter = makeAdapter(partial)
    const builder = makeContextBuilder()
    await expect(
      generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('did not match expected schema')
  })

  it('throws when AI returns JSON with empty required fields', async () => {
    const bad = JSON.stringify({
      name: 'Kira',
      role: '',
      demeanour: 'Cautious',
      secret: 'Has a secret',
      bond_potential: 'Low',
      first_words: 'Hello',
    })
    const adapter = makeAdapter(bad)
    const builder = makeContextBuilder()
    await expect(
      generateNPC({ adapter, contextBuilder: builder }, NPC_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('did not match expected schema')
  })
})
