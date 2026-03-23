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
    const { systemPrompt, estimated } = await this.enforceGuards(request.intent, request)

    const messages = [...(request.history ?? [])]
    if (request.userMessage !== undefined) {
      messages.push({ role: 'user', content: request.userMessage })
    }

    const text = await this.adapter.complete(systemPrompt, messages, request.options ?? {})
    this.costGuard.recordSpend(this.sessionId, estimated)

    return { text, intent: request.intent, tokensUsed: estimated }
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    const { systemPrompt, estimated } = await this.enforceGuards(request.intent, request)

    const messages = [...(request.history ?? [])]
    if (request.userMessage !== undefined) {
      messages.push({ role: 'user', content: request.userMessage })
    }

    for await (const delta of this.adapter.stream(systemPrompt, messages, request.options ?? {})) {
      yield { delta, done: false }
    }
    yield { delta: '', done: true }

    this.costGuard.recordSpend(this.sessionId, estimated)
  }

  getCapabilities(): ProviderCapabilities {
    return this.adapter.getCapabilities()
  }

  getTier(): AITier {
    return this.tier
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async enforceGuards(
    intent: AIIntent,
    request: CompletionRequest
  ): Promise<{ systemPrompt: string; estimated: number }> {
    // 1. Feature gate: is this intent allowed for the tier?
    if (!this.tierGuard.isAllowed(this.tier, intent)) {
      throw new TierBlockedError(intent, this.tierGuard.getFallback(intent))
    }

    // 2. Rate limit: has the user exceeded their daily quota?
    const quota = await this.tierGuard.checkQuota(this.userId, this.tier)
    if (!quota.allowed) {
      throw new QuotaExceededError()
    }

    // 3. Cost estimate: build prompt once, reuse for dispatch.
    const systemPrompt = this.contextBuilder.build(intent, request.context)
    const estimated = this.costGuard.estimateCost(intent, systemPrompt.length)
    const budgetStatus = this.costGuard.checkBudget(this.sessionId, estimated)
    if (budgetStatus === 'block') {
      throw new BudgetExceededError(estimated)
    }

    return { systemPrompt, estimated }
  }
}
