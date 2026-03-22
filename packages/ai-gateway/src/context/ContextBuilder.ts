// ContextBuilder — assembles GameContext per intent, applying token-budget trimming

import type { GameContext, AIIntent } from '@saga-keeper/domain'
import type { IPromptTemplate } from '../templates/PromptTemplate'
import { TokenBudget } from './TokenBudget'

export interface ContextBuilderOptions {
  /** Token ceiling for the assembled system prompt. Default: 4000 */
  maxTokens?: number
  /**
   * Chars-per-token ratio for budget estimation.
   * Varies by model family (Claude ~3.5, GPT-4 ~4.2). Default: 4.
   */
  charsPerToken?: number
}

export interface IContextBuilder {
  /**
   * Produce a system prompt string from a GameContext + intent.
   * Trims recentEvents (oldest first) and world entities to stay within maxTokens.
   */
  build(intent: AIIntent, context: GameContext): string
}

// 60% of the variable budget goes to recent events; 40% to world entities.
// Rationale: the session log carries the most time-sensitive context for move
// resolution and narration. World entities are useful but less turn-critical.
// Adjust if empirical testing shows a different split produces better AI output.
const EVENT_BUDGET_SHARE = 0.6

// Reserved chars for template boilerplate (headers, labels, whitespace).
const BOILERPLATE_RESERVE_CHARS = 800

export class ContextBuilder implements IContextBuilder {
  private readonly maxTokens: number
  private readonly charsPerToken: number | undefined

  constructor(
    private readonly template: IPromptTemplate,
    opts: ContextBuilderOptions = {},
  ) {
    this.maxTokens = opts.maxTokens ?? 4000
    this.charsPerToken = opts.charsPerToken
  }

  build(intent: AIIntent, context: GameContext): string {
    const budget = new TokenBudget({
      maxTokens: this.maxTokens,
      ...(this.charsPerToken !== undefined && { charsPerToken: this.charsPerToken }),
    })

    // Fixed sections: characters + oracle history (naturally bounded by game state)
    const fixedText =
      context.characters.map((c) => c.summary).join('\n') +
      context.oracleHistory.map((r) => r.raw).join('\n')

    const usedChars = fixedText.length + BOILERPLATE_RESERVE_CHARS
    const remaining = budget.remaining(usedChars)

    const eventBudgetChars = Math.floor(remaining * EVENT_BUDGET_SHARE)
    const entityBudgetChars = remaining - eventBudgetChars

    const { items: trimmedEvents } = budget.trimToFit(
      context.recentEvents,
      (e) => `- ${e.type}: ${JSON.stringify(e.payload)}`,
      eventBudgetChars,
    )

    // Entities without a meaningful name are excluded — they contribute noise to the
    // budget calculation and produce malformed output in the rendered template.
    const namedEntities = context.world.entities.filter((e) => e.name.trim().length > 0)
    const { items: trimmedEntities } = budget.trimToFit(
      namedEntities,
      (e) => `${e.name}: ${e.description ?? ''}`,
      entityBudgetChars,
    )

    const trimmedContext: GameContext = {
      ...context,
      recentEvents: trimmedEvents,
      world: {
        entities: trimmedEntities,
        // Preserve the true total — callers use this to know how much was omitted
        totalEntityCount: context.world.totalEntityCount,
      },
    }

    return this.template.render(context.rulesetId, intent, trimmedContext)
  }
}
