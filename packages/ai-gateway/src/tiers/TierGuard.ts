// TierGuard — enforces tier rules per intent + per-user daily rate limiting
// Ported from ironsworn-ai-experiment KV rate-limiting pattern, extended with
// per-tier quotas and intent-level feature gating.

import type { AITier, AIIntent } from '@saga-keeper/domain'

// ── Public types ─────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

/** Abstract key–value store for rate-limit counters (mirrors Cloudflare KV API shape). */
export interface RateLimitStore {
  get(key: string): Promise<number | undefined>
  set(key: string, value: number, ttlSeconds: number): Promise<void>
}

export interface ITierGuard {
  /** Synchronous feature gate — does this tier permit the given intent at all? */
  isAllowed(tier: AITier, intent: AIIntent): boolean
  /** Human-readable fallback text when an intent is blocked by the tier. */
  getFallback(intent: AIIntent): string
  /** Async rate-limit check — consumes one request if under the daily quota. */
  checkQuota(userId: string, tier: AITier): Promise<RateLimitResult>
}

// ── Configuration ────────────────────────────────────────────────────────────

/** Daily request quotas per tier. */
const TIER_DAILY_LIMITS: Readonly<Record<AITier, number>> = {
  offline: 0,
  assisted: 20,
  'full-skald': 100,
}

/** Intents each tier is allowed to access. */
const TIER_ALLOWED_INTENTS: Readonly<Record<AITier, ReadonlySet<AIIntent>>> = {
  offline: new Set(),
  assisted: new Set<AIIntent>([
    'oracle.narrate',
    'oracle.extract',
    'skald.narrate',
    'skald.move',
  ]),
  'full-skald': new Set<AIIntent>([
    'oracle.narrate',
    'oracle.extract',
    'skald.narrate',
    'skald.move',
    'world.generate',
    'world.expand',
    'forge.counsel',
    'hall.reminder',
  ]),
}

const INTENT_FALLBACK_MESSAGES: Readonly<Record<AIIntent, string>> = {
  'oracle.narrate': 'Oracle narration is not available on your current tier.',
  'oracle.extract': 'Oracle extraction is not available on your current tier.',
  'skald.narrate': 'Skald narration is not available on your current tier.',
  'skald.move': 'Move resolution is not available on your current tier.',
  'world.generate': 'World generation requires the full-skald tier.',
  'world.expand': 'World expansion requires the full-skald tier.',
  'forge.counsel': 'Forge counsel requires the full-skald tier.',
  'hall.reminder': 'Session recaps require the full-skald tier.',
}

// ── In-memory RateLimitStore ─────────────────────────────────────────────────

/** Simple in-memory store for development and testing. */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly data = new Map<string, { value: number; expiresAt: number }>()

  async get(key: string): Promise<number | undefined> {
    const entry = this.data.get(key)
    if (entry === undefined) return undefined
    if (Date.now() >= entry.expiresAt) {
      this.data.delete(key)
      return undefined
    }
    return entry.value
  }

  async set(key: string, value: number, ttlSeconds: number): Promise<void> {
    this.data.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }
}

// ── TierGuard implementation ─────────────────────────────────────────────────

/**
 * Rate-limit key format: `rl:{userId}:{YYYY-MM-DD}`
 * Mirrors the Cloudflare experiment pattern but with per-tier daily limits.
 */
function rateLimitKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `rl:${userId}:${today}`
}

function secondsUntilMidnightUTC(): number {
  return 86_400 - (Math.floor(Date.now() / 1000) % 86_400)
}

export class TierGuard implements ITierGuard {
  constructor(private readonly store: RateLimitStore) {}

  isAllowed(tier: AITier, intent: AIIntent): boolean {
    return TIER_ALLOWED_INTENTS[tier].has(intent)
  }

  getFallback(intent: AIIntent): string {
    return INTENT_FALLBACK_MESSAGES[intent]
  }

  async checkQuota(userId: string, tier: AITier): Promise<RateLimitResult> {
    const limit = TIER_DAILY_LIMITS[tier]
    if (limit === 0) {
      return { allowed: false, remaining: 0 }
    }

    const key = rateLimitKey(userId)
    const current = (await this.store.get(key)) ?? 0

    if (current >= limit) {
      return { allowed: false, remaining: 0 }
    }

    await this.store.set(key, current + 1, secondsUntilMidnightUTC())
    return { allowed: true, remaining: limit - (current + 1) }
  }
}
