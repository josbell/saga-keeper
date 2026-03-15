// TierGuard — enforces tier rules per intent — TODO: implement
import type { AITier, AIIntent } from '@saga-keeper/domain'
export interface ITierGuard {
  isAllowed(tier: AITier, intent: AIIntent): boolean
  getFallback(intent: AIIntent): string
}
