// SessionService — TODO: implement
import type { SessionEvent, NarrativeTurn } from '@saga-keeper/domain'
export interface ISessionService {
  startSession(campaignId: string): Promise<void>
  appendEvent(event: SessionEvent): Promise<void>
  getRecentTurns(campaignId: string, limit: number): Promise<NarrativeTurn[]>
}
