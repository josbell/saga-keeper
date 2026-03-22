// AnthropicAdapter — MVP provider — proxied, never exposes key to client bundle

import Anthropic from '@anthropic-ai/sdk'
import type { ProviderAdapter, Message, CompletionOptions, ProviderCapabilities } from '@saga-keeper/domain'

const MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_MAX_TOKENS = 1024

export class AnthropicAdapter implements ProviderAdapter {
  readonly id = 'anthropic'
  readonly displayName = 'Anthropic (Claude)'

  private readonly client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic(apiKey !== undefined ? { apiKey } : {})
  }

  async complete(
    systemPrompt: string,
    messages: Message[],
    options: CompletionOptions,
  ): Promise<string> {
    const filtered = toAnthropicMessages(messages)
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: filtered,
    })

    logUsage(response.usage)

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
  }

  async *stream(
    systemPrompt: string,
    messages: Message[],
    options: CompletionOptions,
  ): AsyncIterable<string> {
    const filtered = toAnthropicMessages(messages)
    const stream = this.client.messages.stream({
      model: MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: filtered,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: true,
      maxContextTokens: 200_000,
      supportsSystemPrompt: true,
      localOnly: false,
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toAnthropicMessages(messages: Message[]): Anthropic.MessageParam[] {
  return messages
    .filter((m): m is Message & { role: 'user' | 'assistant' } => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))
}

function logUsage(usage: Anthropic.Usage): void {
  const cacheRead = usage.cache_read_input_tokens ?? 0
  const cacheCreation = usage.cache_creation_input_tokens ?? 0
  console.log(
    `[AnthropicAdapter] tokens — input: ${usage.input_tokens}, output: ${usage.output_tokens}, cache_read: ${cacheRead}, cache_creation: ${cacheCreation}`,
  )
}
