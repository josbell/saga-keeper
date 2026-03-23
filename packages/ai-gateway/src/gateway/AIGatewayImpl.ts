// AIGateway implementation — spec §6
// Orchestrates tier gating, rate limiting, cost estimation, context building,
// and provider dispatch. Every intent flows through both guards before reaching
// the adapter.

import type {
  AIGateway,
  AIIntent,
  AITier,
  CompletionRequest,
  CompletionResponse,
  ProviderAdapter,
  ProviderCapabilities,
  StreamChunk,
} from '@saga-keeper/domain'
import type { IContextBuilder } from '../context/ContextBuilder'
import type { ITierGuard } from '../tiers/TierGuard'
import type { ICostGuard } from '../cost/CostGuard'
import type { IPromptTemplate } from '../templates/PromptTemplate'
import type { TemplateRegistry } from '../templates/TemplateRegistry'

// ── Error types ──────────────────────────────────────────────────────────────

export class TierBlockedError extends Error {
  readonly code = 'TIER_BLOCKED' as const
  constructor(
    readonly intent: AIIntent,
    readonly fallback: string
  ) {
    super(`Intent "${intent}" is not available on your current tier.`)
    this.name = 'TierBlockedError'
  }
}

export class QuotaExceededError extends Error {
  readonly code = 'QUOTA_EXCEEDED' as const
  constructor() {
    super('Daily AI request limit reached. Try again tomorrow.')
    this.name = 'QuotaExceededError'
  }
}

export class BudgetExceededError extends Error {
  readonly code = 'BUDGET_EXCEEDED' as const
  constructor(readonly estimated: number) {
    super('Session token budget exhausted.')
    this.name = 'BudgetExceededError'
  }
}

// ── Gateway options ──────────────────────────────────────────────────────────

export interface AIGatewayImplOptions {
  adapter: ProviderAdapter
  tier: AITier
  tierGuard: ITierGuard
  costGuard: ICostGuard
  contextBuilder: IContextBuilder
  templateRegistry: TemplateRegistry
  userId: string
  sessionId: string
}

// ── Implementation ───────────────────────────────────────────────────────────

export class AIGatewayImpl implements AIGateway {
  private readonly adapter: ProviderAdapter
  private readonly tier: AITier
  private readonly tierGuard: ITierGuard
  private readonly costGuard: ICostGuard
  private readonly contextBuilder: IContextBuilder
  private readonly templateRegistry: TemplateRegistry
  private readonly userId: string
  private readonly sessionId: string

  constructor(options: AIGatewayImplOptions) {
    this.adapter = options.adapter
    this.tier = options.tier
    this.tierGuard = options.tierGuard
    this.costGuard = options.costGuard
    this.contextBuilder = options.contextBuilder
    this.templateRegistry = options.templateRegistry
    this.userId = options.userId
    this.sessionId = options.sessionId
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    await this.enforceGuards(request.intent, request)

    const systemPrompt = this.buildSystemPrompt(request)
    const messages = request.history ?? []
    if (request.userMessage !== undefined) {
      messages.push({ role: 'user', content: request.userMessage })
    }

    const text = await this.adapter.complete(systemPrompt, messages, request.options ?? {})

    // Estimate tokens used from response length (rough, but consistent with adapter telemetry)
    const tokensUsed = Math.ceil(text.length / 4) + (request.options?.maxTokens ?? 0)
    this.costGuard.recordSpend(this.sessionId, tokensUsed)

    return { text, intent: request.intent, tokensUsed }
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    await this.enforceGuards(request.intent, request)

    const systemPrompt = this.buildSystemPrompt(request)
    const messages = request.history ?? []
    if (request.userMessage !== undefined) {
      messages.push({ role: 'user', content: request.userMessage })
    }

    let accumulated = ''
    for await (const delta of this.adapter.stream(systemPrompt, messages, request.options ?? {})) {
      accumulated += delta
      yield { delta, done: false }
    }
    yield { delta: '', done: true }

    const tokensUsed = Math.ceil(accumulated.length / 4)
    this.costGuard.recordSpend(this.sessionId, tokensUsed)
  }

  getCapabilities(): ProviderCapabilities {
    return this.adapter.getCapabilities()
  }

  getTier(): AITier {
    return this.tier
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async enforceGuards(intent: AIIntent, request: CompletionRequest): Promise<void> {
    // 1. Feature gate: is this intent allowed for the tier?
    if (!this.tierGuard.isAllowed(this.tier, intent)) {
      throw new TierBlockedError(intent, this.tierGuard.getFallback(intent))
    }

    // 2. Rate limit: has the user exceeded their daily quota?
    const quota = await this.tierGuard.checkQuota(this.userId, this.tier)
    if (!quota.allowed) {
      throw new QuotaExceededError()
    }

    // 3. Cost estimate: will this request push the session over budget?
    const contextText = this.contextBuilder.build(intent, request.context)
    const estimated = this.costGuard.estimateCost(intent, contextText.length)
    const budgetStatus = this.costGuard.checkBudget(this.sessionId, estimated)
    if (budgetStatus === 'block') {
      throw new BudgetExceededError(estimated)
    }
  }

  private buildSystemPrompt(request: CompletionRequest): string {
    return this.contextBuilder.build(request.intent, request.context)
  }
}
