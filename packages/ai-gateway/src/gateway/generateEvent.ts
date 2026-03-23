// generateEvent — end-to-end random event generation via the AI gateway.
// Mirrors the pattern from generateNPC.ts, adapted for the event.generate intent.

import type {
  ProviderAdapter,
  CompletionOptions,
  EventGenerationContext,
  GameContext,
} from '@saga-keeper/domain'
import type { IContextBuilder } from '../context/ContextBuilder'
import type { RandomEvent } from '../parsers/index'
import { RandomEventSchema, parseStructuredOutput } from '../parsers/index'
import { buildEventUserPrompt } from '../prompts/buildEventUserPrompt'

export interface GenerateEventDeps {
  /** Provider adapter to call the AI model. */
  adapter: ProviderAdapter
  /** Context builder to assemble the system prompt. */
  contextBuilder: IContextBuilder
}

export interface GenerateEventResult {
  event: RandomEvent
  raw: string
}

/**
 * Generate a structured random event from narrative context.
 *
 * 1. Builds a system prompt via `contextBuilder.build('event.generate', gameContext)`
 * 2. Builds a user message from the `EventGenerationContext` (scene, vow)
 * 3. Calls the provider adapter
 * 4. Validates the response against `RandomEventSchema`
 * 5. Returns the validated RandomEvent
 */
export async function generateEvent(
  deps: GenerateEventDeps,
  eventContext: EventGenerationContext,
  gameContext: GameContext,
  options?: CompletionOptions
): Promise<GenerateEventResult> {
  const systemPrompt = deps.contextBuilder.build('event.generate', gameContext)
  const userMessage = buildEventUserPrompt(eventContext)

  const raw = await deps.adapter.complete(systemPrompt, [{ role: 'user', content: userMessage }], {
    maxTokens: 512,
    ...options,
  })

  const event = parseStructuredOutput(RandomEventSchema, raw)

  return { event, raw }
}
