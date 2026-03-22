// AnthropicAdapter — TDD test suite
// vi.mock must appear before the adapter import so Vitest's module factory runs first.

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn()
  const mockStream = vi.fn()
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate, stream: mockStream },
  }))
  ;(MockAnthropic as unknown as Record<string, unknown>)['mockCreate'] = mockCreate
  ;(MockAnthropic as unknown as Record<string, unknown>)['mockStream'] = mockStream
  return { default: MockAnthropic }
})

import Anthropic from '@anthropic-ai/sdk'
import { AnthropicAdapter } from './AnthropicAdapter'
import type { Message } from '@saga-keeper/domain'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMockCreate() {
  return (Anthropic as unknown as Record<string, ReturnType<typeof vi.fn>>)['mockCreate']!
}
function getMockStream() {
  return (Anthropic as unknown as Record<string, ReturnType<typeof vi.fn>>)['mockStream']!
}

/** Returns the first argument of the most recent call to a mock function. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lastCallArg(mockFn: ReturnType<typeof vi.fn>): any {
  // Casting to any to avoid noUncheckedIndexedAccess errors in test helpers —
  // strict index checking is not useful when asserting mock call arguments.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return (mockFn.mock as any).calls[0][0]
}

function makeMessages(...roles: Array<'user' | 'assistant' | 'system'>): Message[] {
  return roles.map((role, i) => ({ role, content: `content-${i}` }))
}

function mockCompletionResponse(text: string, usageOverride?: object) {
  getMockCreate().mockResolvedValue({
    content: [{ type: 'text', text }],
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_read_input_tokens: 0,
      cache_creation_input_tokens: 0,
      ...usageOverride,
    },
  })
}

function makeStreamMock(chunks: string[]) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const text of chunks) {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
      }
      yield { type: 'message_stop' }
    },
  }
}

async function collectStream(iterable: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = []
  for await (const chunk of iterable) out.push(chunk)
  return out
}

// ── Reset mocks between tests ─────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(Anthropic).mockClear()
  getMockCreate().mockReset()
  getMockStream().mockReset()
})

// ── Chunk 1: Identity & getCapabilities() ────────────────────────────────────

describe('AnthropicAdapter — identity', () => {
  it('has id "anthropic"', () => {
    expect(new AnthropicAdapter('test-key').id).toBe('anthropic')
  })

  it('has a non-empty displayName', () => {
    expect(new AnthropicAdapter('test-key').displayName.length).toBeGreaterThan(0)
  })
})

describe('AnthropicAdapter.getCapabilities()', () => {
  it('reports streaming: true', () => {
    expect(new AnthropicAdapter('k').getCapabilities().streaming).toBe(true)
  })

  it('reports maxContextTokens: 200_000', () => {
    expect(new AnthropicAdapter('k').getCapabilities().maxContextTokens).toBe(200_000)
  })

  it('reports supportsSystemPrompt: true', () => {
    expect(new AnthropicAdapter('k').getCapabilities().supportsSystemPrompt).toBe(true)
  })

  it('reports localOnly: false', () => {
    expect(new AnthropicAdapter('k').getCapabilities().localOnly).toBe(false)
  })
})

// ── Chunk 2: Constructor / API key ───────────────────────────────────────────

describe('AnthropicAdapter — constructor', () => {
  it('passes the provided apiKey to Anthropic constructor', () => {
    new AnthropicAdapter('my-secret-key')
    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({ apiKey: 'my-secret-key' })
  })

  it('omits apiKey when none provided (SDK picks up env itself)', () => {
    new AnthropicAdapter()
    expect(vi.mocked(Anthropic)).toHaveBeenCalledWith({})
  })

  it('constructs a new Anthropic client instance per adapter', () => {
    new AnthropicAdapter('k1')
    new AnthropicAdapter('k2')
    expect(vi.mocked(Anthropic)).toHaveBeenCalledTimes(2)
  })
})

// ── Chunk 3: complete() — happy path ─────────────────────────────────────────

describe('AnthropicAdapter.complete() — happy path', () => {
  it('returns the text content from the response', async () => {
    mockCompletionResponse('The raven speaks.')
    const result = await new AnthropicAdapter('k').complete('You are a skald.', makeMessages('user'), {})
    expect(result).toBe('The raven speaks.')
  })

  it('calls messages.create with model claude-haiku-4-5-20251001', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect(lastCallArg(getMockCreate()).model).toBe('claude-haiku-4-5-20251001')
  })

  it('wraps system prompt with cache_control: ephemeral', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('My system prompt', makeMessages('user'), {})
    expect(lastCallArg(getMockCreate()).system).toEqual([
      { type: 'text', text: 'My system prompt', cache_control: { type: 'ephemeral' } },
    ])
  })

  it('defaults max_tokens to 1024 when not specified', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect(lastCallArg(getMockCreate()).max_tokens).toBe(1024)
  })

  it('respects maxTokens from options', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), { maxTokens: 512 })
    expect(lastCallArg(getMockCreate()).max_tokens).toBe(512)
  })

  it('passes temperature from options when provided', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), { temperature: 0.7 })
    expect(lastCallArg(getMockCreate()).temperature).toBe(0.7)
  })

  it('omits temperature from SDK call when not provided', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect('temperature' in lastCallArg(getMockCreate())).toBe(false)
  })
})

// ── Chunk 4: complete() — message filtering ───────────────────────────────────

describe('AnthropicAdapter.complete() — message filtering', () => {
  it('filters out system-role messages from history', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('user', 'system', 'assistant', 'user'), {})
    const roles = (lastCallArg(getMockCreate()).messages as Message[]).map((m) => m.role)
    expect(roles).not.toContain('system')
  })

  it('preserves user and assistant messages in order', async () => {
    mockCompletionResponse('ok')
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Greetings' },
      { role: 'user', content: 'Continue' },
    ]
    await new AnthropicAdapter('k').complete('sys', messages, {})
    expect(lastCallArg(getMockCreate()).messages).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Greetings' },
      { role: 'user', content: 'Continue' },
    ])
  })

  it('sends an empty messages array when all messages are system-role', async () => {
    mockCompletionResponse('ok')
    await new AnthropicAdapter('k').complete('sys', makeMessages('system', 'system'), {})
    expect(lastCallArg(getMockCreate()).messages).toEqual([])
  })

  it('works with an empty message list', async () => {
    mockCompletionResponse('ok')
    await expect(new AnthropicAdapter('k').complete('sys', [], {})).resolves.toBe('ok')
    expect(lastCallArg(getMockCreate()).messages).toEqual([])
  })
})

// ── Chunk 5: complete() — token telemetry ────────────────────────────────────

describe('AnthropicAdapter.complete() — token telemetry', () => {
  it('logs input_tokens and output_tokens', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    mockCompletionResponse('ok', { input_tokens: 123, output_tokens: 45 })
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    const logOutput = spy.mock.calls.flat().join(' ')
    expect(logOutput).toContain('123')
    expect(logOutput).toContain('45')
    spy.mockRestore()
  })

  it('logs cache_read_input_tokens and cache_creation_input_tokens', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    mockCompletionResponse('ok', { cache_read_input_tokens: 200, cache_creation_input_tokens: 50 })
    await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    const logOutput = spy.mock.calls.flat().join(' ')
    expect(logOutput).toContain('200')
    expect(logOutput).toContain('50')
    spy.mockRestore()
  })
})

// ── Chunk 6: complete() — edge cases & errors ────────────────────────────────

describe('AnthropicAdapter.complete() — edge cases', () => {
  it('returns empty string when response content array is empty', async () => {
    getMockCreate().mockResolvedValue({
      content: [],
      usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    })
    const result = await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect(result).toBe('')
  })

  it('skips non-text content blocks and returns empty string', async () => {
    getMockCreate().mockResolvedValue({
      content: [{ type: 'tool_use', id: 'tu_1', name: 'some_tool', input: {} }],
      usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    })
    const result = await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect(result).toBe('')
  })

  it('concatenates multiple text blocks', async () => {
    getMockCreate().mockResolvedValue({
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world' },
      ],
      usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    })
    const result = await new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})
    expect(result).toBe('Hello world')
  })

  it('rejects when messages.create throws', async () => {
    getMockCreate().mockRejectedValue(new Error('Network error'))
    await expect(new AnthropicAdapter('k').complete('sys', makeMessages('user'), {})).rejects.toThrow('Network error')
  })
})

// ── Chunk 7: stream() — happy path ───────────────────────────────────────────

describe('AnthropicAdapter.stream() — happy path', () => {
  it('yields each text delta chunk in order', async () => {
    getMockStream().mockReturnValue(makeStreamMock(['Once ', 'upon ', 'a time']))
    const chunks = await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect(chunks).toEqual(['Once ', 'upon ', 'a time'])
  })

  it('calls messages.stream with model claude-haiku-4-5-20251001', async () => {
    getMockStream().mockReturnValue(makeStreamMock(['x']))
    await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect(lastCallArg(getMockStream()).model).toBe('claude-haiku-4-5-20251001')
  })

  it('uses cache_control: ephemeral on system prompt in stream call', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    await collectStream(new AnthropicAdapter('k').stream('My system', makeMessages('user'), {}))
    expect(lastCallArg(getMockStream()).system).toEqual([
      { type: 'text', text: 'My system', cache_control: { type: 'ephemeral' } },
    ])
  })

  it('defaults max_tokens to 1024 in stream call', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect(lastCallArg(getMockStream()).max_tokens).toBe(1024)
  })

  it('yields nothing for a stream with no text_delta events', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    const chunks = await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect(chunks).toHaveLength(0)
  })

  it('omits temperature from stream call when not provided', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect('temperature' in lastCallArg(getMockStream())).toBe(false)
  })

  it('passes temperature to stream call when provided', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), { temperature: 0.5 }))
    expect(lastCallArg(getMockStream()).temperature).toBe(0.5)
  })
})

// ── Chunk 8: stream() — filtering & errors ───────────────────────────────────

describe('AnthropicAdapter.stream() — message filtering', () => {
  it('filters system-role messages from stream call', async () => {
    getMockStream().mockReturnValue(makeStreamMock([]))
    await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user', 'system', 'assistant'), {}))
    const roles = (lastCallArg(getMockStream()).messages as Message[]).map((m) => m.role)
    expect(roles).not.toContain('system')
  })
})

describe('AnthropicAdapter.stream() — error handling', () => {
  it('propagates errors from the stream', async () => {
    const failingStream = {
      async *[Symbol.asyncIterator](): AsyncGenerator<never> {
        throw new Error('Stream broken')
      },
    }
    getMockStream().mockReturnValue(failingStream)
    await expect(
      collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {})),
    ).rejects.toThrow('Stream broken')
  })

  it('skips non-text_delta events without throwing', async () => {
    const mixedStream = {
      async *[Symbol.asyncIterator]() {
        yield { type: 'message_start', message: {} }
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } }
        yield { type: 'content_block_stop', index: 0 }
      },
    }
    getMockStream().mockReturnValue(mixedStream)
    const result = await collectStream(new AnthropicAdapter('k').stream('sys', makeMessages('user'), {}))
    expect(result).toEqual(['hi'])
  })
})
