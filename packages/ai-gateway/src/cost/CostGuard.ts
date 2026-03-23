// CostGuard — tracks session spend, warns at 80%, blocks at 100%
// Estimates token cost from intent type + context size before calls.

import type { AIIntent } from '@saga-keeper/domain'

// ── Public types ─────────────────────────────────────────────────────────────

export interface ICostGuard {
  checkBudget(sessionId: string, estimated: number): 'ok' | 'warn' | 'block'
  recordSpend(sessionId: string, tokensUsed: number): void
  /** Estimate total tokens for a request (input + predicted output). */
  estimateCost(intent: AIIntent, contextChars: number): number
}

// ── Configuration ────────────────────────────────────────────────────────────

const DEFAULT_SESSION_BUDGET = 50_000 // tokens per session
const DEFAULT_CHARS_PER_TOKEN = 4 // Claude average
const WARN_THRESHOLD = 0.8

/** Conservative output-token estimates per intent type. */
const INTENT_OUTPUT_ESTIMATES: Readonly<Record<AIIntent, number>> = {
  'oracle.narrate': 256,
  'oracle.extract': 256,
  'skald.narrate': 512,
  'skald.move': 512,
  'world.generate': 512,
  'world.expand': 512,
  'forge.counsel': 512,
  'hall.reminder': 1024,
}

// ── CostGuard implementation ─────────────────────────────────────────────────

export interface CostGuardOptions {
  /** Token budget per session. Default: 50 000. */
  budget?: number
  /** Chars-per-token ratio for input estimation. Default: 4. */
  charsPerToken?: number
}

export class CostGuard implements ICostGuard {
  private readonly sessionSpend = new Map<string, number>()
  private readonly budget: number
  private readonly charsPerToken: number

  constructor(options: CostGuardOptions = {}) {
    this.budget = options.budget ?? DEFAULT_SESSION_BUDGET
    this.charsPerToken = options.charsPerToken ?? DEFAULT_CHARS_PER_TOKEN
  }

  estimateCost(intent: AIIntent, contextChars: number): number {
    const inputTokens = Math.ceil(contextChars / this.charsPerToken)
    return inputTokens + INTENT_OUTPUT_ESTIMATES[intent]
  }

  checkBudget(sessionId: string, estimated: number): 'ok' | 'warn' | 'block' {
    const spent = this.sessionSpend.get(sessionId) ?? 0
    const projected = spent + estimated
    if (projected >= this.budget) return 'block'
    if (projected >= this.budget * WARN_THRESHOLD) return 'warn'
    return 'ok'
  }

  recordSpend(sessionId: string, tokensUsed: number): void {
    const current = this.sessionSpend.get(sessionId) ?? 0
    this.sessionSpend.set(sessionId, current + tokensUsed)
  }
}
