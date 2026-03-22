// Structured-output parsers for AI responses
// Adapted from ironsworn-ai-experiment/src/lib/ai/schemas.ts

import { z } from 'zod'

/**
 * NPC produced by the `world.generate` intent.
 * All string fields use `.min(1)` to reject empty-string placeholders that
 * AI models occasionally emit when they have insufficient context.
 */
export const NPCSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  demeanour: z.string().min(1),
  secret: z.string().min(1),
  bond_potential: z.string().min(1),
  first_words: z.string().min(1),
})

export type NPC = z.infer<typeof NPCSchema>

/**
 * Random event produced by the `world.expand` intent.
 * All string fields use `.min(1)` to reject empty-string placeholders.
 */
export const RandomEventSchema = z.object({
  trigger: z.string().min(1),
  complication: z.string().min(1),
  opportunity: z.string().min(1),
  oracle_hint: z.string().min(1),
})

export type RandomEvent = z.infer<typeof RandomEventSchema>

/**
 * Parse a raw AI response string as JSON, then validate against the
 * provided Zod schema. Throws a descriptive error on failure.
 */
export function parseStructuredOutput<T>(schema: z.ZodType<T>, raw: string): T {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`AI response was not valid JSON.\n\nRaw response:\n${raw}`)
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `AI response did not match expected schema.\n\nErrors:\n${result.error.message}\n\nRaw response:\n${raw}`
    )
  }

  return result.data
}
