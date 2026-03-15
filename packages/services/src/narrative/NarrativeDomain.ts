// NarrativeDomain — orchestrates a full Skald turn (spec §8) — TODO: implement
import type { PlayerAction, NarrativeTurn } from '@saga-keeper/domain'
export interface INarrativeDomain {
  processTurn(campaignId: string, action: PlayerAction): Promise<NarrativeTurn>
}
