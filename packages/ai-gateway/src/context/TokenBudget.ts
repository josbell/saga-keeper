// TokenBudget — token estimation and context trimming utilities

export interface TokenBudgetOptions {
  /** Total token ceiling for the assembled system prompt */
  maxTokens: number
  /**
   * Rough chars-per-token ratio for estimation.
   * Anthropic Claude averages ~4 chars/token for English prose.
   * Default: 4
   */
  charsPerToken?: number
}

export interface TrimResult<T> {
  items: T[]
  /** How many items were dropped from the front */
  dropped: number
}

export interface ITokenBudget {
  /** Estimate token count for an arbitrary string */
  estimate(text: string): number
  /**
   * Trim an ordered list (newest-last) to fit within `remainingChars`.
   * Items are dropped from the FRONT (oldest-first) until budget fits.
   */
  trimToFit<T>(items: T[], serialize: (item: T) => string, remainingChars: number): TrimResult<T>
  /** Remaining character budget after reserving `usedChars` */
  remaining(usedChars: number): number
}

export class TokenBudget implements ITokenBudget {
  private readonly ratio: number
  private readonly budgetChars: number

  constructor(opts: TokenBudgetOptions) {
    this.ratio = opts.charsPerToken ?? 4
    this.budgetChars = opts.maxTokens * this.ratio
  }

  estimate(text: string): number {
    if (text.length === 0) return 0
    return Math.ceil(text.length / this.ratio)
  }

  remaining(usedChars: number): number {
    return Math.max(0, this.budgetChars - usedChars)
  }

  trimToFit<T>(items: T[], serialize: (item: T) => string, remainingChars: number): TrimResult<T> {
    // Work backwards (newest first), accumulate size until budget is exhausted
    let budget = remainingChars
    let keepFrom = items.length

    for (let i = items.length - 1; i >= 0; i--) {
      const size = serialize(items[i]!).length
      if (budget - size < 0) break
      budget -= size
      keepFrom = i
    }

    const kept = items.slice(keepFrom)
    return { items: kept, dropped: keepFrom }
  }
}
