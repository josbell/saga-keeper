// User prompt builder for the event.generate intent.
// Adapted from ironsworn-ai-experiment/src/lib/ai/prompts.ts — buildRandomEventUserPrompt()

import type { EventGenerationContext } from '@saga-keeper/domain'

/**
 * Build the user-role message for the `event.generate` intent.
 * Accepts structured narrative context and returns a prompt string
 * instructing the model to return JSON with the RandomEvent schema fields.
 */
export function buildEventUserPrompt(ctx: EventGenerationContext): string {
  const lines: string[] = []
  lines.push(`Current scene: ${ctx.scene}`)
  if (ctx.vow) {
    lines.push(`Active vow: ${ctx.vow}`)
  }
  lines.push('')
  lines.push(
    'Generate a random event for this scene. Return JSON with fields: trigger, complication, opportunity, oracle_hint'
  )
  return lines.join('\n')
}
