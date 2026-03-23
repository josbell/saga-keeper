// User prompt builder for the npc.generate intent.
// Adapted from ironsworn-ai-experiment/src/lib/ai/prompts.ts — buildNPCUserPrompt()

import type { NPCGenerationContext } from '@saga-keeper/domain'

/**
 * Build the user-role message for the `npc.generate` intent.
 * Accepts structured narrative context and returns a prompt string
 * instructing the model to return JSON with the NPC schema fields.
 */
export function buildNPCUserPrompt(ctx: NPCGenerationContext): string {
  const lines: string[] = []
  lines.push(`Current scene: ${ctx.scene}`)
  lines.push(`Active vow: ${ctx.vow}`)
  if (ctx.encounter) {
    lines.push(`Encounter: ${ctx.encounter}`)
  }
  lines.push('')
  lines.push(
    'Generate an NPC for this context. Return JSON with fields: name, role, demeanour, secret, bond_potential, first_words'
  )
  return lines.join('\n')
}
