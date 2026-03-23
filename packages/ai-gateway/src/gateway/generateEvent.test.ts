import { describe, it, expect, vi } from 'vitest'
import { generateEvent } from './generateEvent'
import type { IContextBuilder } from '../context/ContextBuilder'
import type {
  ProviderAdapter,
  ProviderCapabilities,
  GameContext,
  CharacterSnapshot,
  EventGenerationContext,
} from '@saga-keeper/domain'

const VALID_EVENT_JSON = JSON.stringify({
  trigger: 'A distant horn call echoes through the fog',
  complication: 'Your path is blocked by a collapsed bridge',
  opportunity: 'A hidden ford is visible upstream',
  oracle_hint: 'Ask the Fates whether the horn signals friend or foe',
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

const EVENT_CONTEXT: EventGenerationContext = {
  scene: 'A fog-shrouded forest crossing at dusk',
  vow: 'Deliver the message to the Iron Council',
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

describe('generateEvent — happy path', () => {
  it('returns a validated RandomEvent object', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    const result = await generateEvent(
      { adapter, contextBuilder: builder },
      EVENT_CONTEXT,
      MINIMAL_GAME_CONTEXT
    )
    expect(result.event).toEqual({
      trigger: 'A distant horn call echoes through the fog',
      complication: 'Your path is blocked by a collapsed bridge',
      opportunity: 'A hidden ford is visible upstream',
      oracle_hint: 'Ask the Fates whether the horn signals friend or foe',
    })
  })

  it('returns the raw response string', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    const result = await generateEvent(
      { adapter, contextBuilder: builder },
      EVENT_CONTEXT,
      MINIMAL_GAME_CONTEXT
    )
    expect(result.raw).toBe(VALID_EVENT_JSON)
  })

  it('calls contextBuilder.build with event.generate intent', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    await generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    expect(builder.build).toHaveBeenCalledWith('event.generate', MINIMAL_GAME_CONTEXT)
  })

  it('calls adapter.complete with system prompt and user message containing scene text', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    await generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    expect(adapter.complete).toHaveBeenCalledWith(
      'SYSTEM PROMPT',
      [{ role: 'user', content: expect.stringContaining('A fog-shrouded forest crossing') }],
      expect.objectContaining({ maxTokens: 512 })
    )
  })

  it('user message contains scene and vow', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    await generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    const callArgs = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]!
    const userMsg = callArgs[1][0].content as string
    expect(userMsg).toContain('A fog-shrouded forest crossing at dusk')
    expect(userMsg).toContain('Deliver the message to the Iron Council')
  })

  it('user message omits vow line when vow is not provided', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    const ctx: EventGenerationContext = { scene: 'An empty plain' }
    await generateEvent({ adapter, contextBuilder: builder }, ctx, MINIMAL_GAME_CONTEXT)
    const callArgs = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]!
    const userMsg = callArgs[1][0].content as string
    expect(userMsg).not.toContain('Active vow:')
  })

  it('passes custom CompletionOptions to adapter', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    await generateEvent(
      { adapter, contextBuilder: builder },
      EVENT_CONTEXT,
      MINIMAL_GAME_CONTEXT,
      { temperature: 0.9 }
    )
    expect(adapter.complete).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ temperature: 0.9 })
    )
  })

  it('maxTokens defaults to 512', async () => {
    const adapter = makeAdapter(VALID_EVENT_JSON)
    const builder = makeContextBuilder()
    await generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    expect(adapter.complete).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ maxTokens: 512 })
    )
  })
})

describe('generateEvent — validation', () => {
  it('throws when AI returns invalid JSON', async () => {
    const adapter = makeAdapter('not json at all')
    const builder = makeContextBuilder()
    await expect(
      generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('not valid JSON')
  })

  it('throws when AI returns JSON missing required fields', async () => {
    const partial = JSON.stringify({ trigger: 'Something happened' })
    const adapter = makeAdapter(partial)
    const builder = makeContextBuilder()
    await expect(
      generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('did not match expected schema')
  })

  it('throws when AI returns JSON with empty required string fields', async () => {
    const bad = JSON.stringify({
      trigger: '',
      complication: 'A complication',
      opportunity: 'An opportunity',
      oracle_hint: 'A hint',
    })
    const adapter = makeAdapter(bad)
    const builder = makeContextBuilder()
    await expect(
      generateEvent({ adapter, contextBuilder: builder }, EVENT_CONTEXT, MINIMAL_GAME_CONTEXT)
    ).rejects.toThrow('did not match expected schema')
  })
})
