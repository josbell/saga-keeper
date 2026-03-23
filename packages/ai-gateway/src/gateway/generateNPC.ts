// generateNPC — end-to-end NPC generation via the AI gateway.
// Adapted from ironsworn-ai-experiment/src/lib/ai/client.ts — generateNPC()

import type {
  ProviderAdapter,
  CompletionOptions,
  NPCGenerationContext,
  GameContext,
} from '@saga-keeper/domain'
import type { IContextBuilder } from '../context/ContextBuilder'
import type { NPC } from '../parsers/index'
import { NPCSchema, parseStructuredOutput } from '../parsers/index'
import { buildNPCUserPrompt } from '../prompts/buildNPCUserPrompt'

export interface GenerateNPCDeps {
  /** Provider adapter to call the AI model. */
  adapter: ProviderAdapter
  /** Context builder to assemble the system prompt. */
  contextBuilder: IContextBuilder
}

export interface GenerateNPCResult {
  npc: NPC
  raw: string
}

/**
 * Generate a structured NPC from narrative context.
 *
 * 1. Builds a system prompt via `contextBuilder.build('npc.generate', gameContext)`
 * 2. Builds a user message from the `NPCGenerationContext` (scene, vow, encounter)
 * 3. Calls the provider adapter
 * 4. Validates the response against `NPCSchema`
 * 5. Returns the validated NPC
 */
export async function generateNPC(
  deps: GenerateNPCDeps,
  npcContext: NPCGenerationContext,
  gameContext: GameContext,
  options?: CompletionOptions
): Promise<GenerateNPCResult> {
  const systemPrompt = deps.contextBuilder.build('npc.generate', gameContext)
  const userMessage = buildNPCUserPrompt(npcContext)

  const raw = await deps.adapter.complete(
    systemPrompt,
    [{ role: 'user', content: userMessage }],
    { maxTokens: 512, ...options }
  )

  const npc = parseStructuredOutput(NPCSchema, raw)

  return { npc, raw }
}
