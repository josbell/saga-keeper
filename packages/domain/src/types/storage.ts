// ── Storage adapter interface ─────────────────────────────────────────────────

import type { Campaign, CampaignSummary, NewCampaign } from './campaign'
import type { CharacterState } from './character'
import type { SessionEvent } from './session'
import type { WorldEntity } from './world'

export interface CampaignArchive {
  /** Schema version — used for migration */
  version: string
  exportedAt: string
  rulesetId: string
  campaign: Campaign
  characters: CharacterState[]
  world: WorldEntity[]
  /** Complete session history */
  sessionLog: SessionEvent[]
}

export interface StorageAdapter {
  campaigns: {
    list(): Promise<CampaignSummary[]>
    get(id: string): Promise<Campaign>
    create(data: NewCampaign): Promise<Campaign>
    update(id: string, patch: Partial<Campaign>): Promise<Campaign>
    delete(id: string): Promise<void>
  }

  characters: {
    get(id: string): Promise<CharacterState>
    save(character: CharacterState): Promise<CharacterState>
  }

  session: {
    /** Append-only — events are never edited */
    append(campaignId: string, event: SessionEvent): Promise<void>
    getRecent(campaignId: string, limit: number): Promise<SessionEvent[]>
    getAll(campaignId: string): Promise<SessionEvent[]>
  }

  world: {
    list(campaignId: string): Promise<WorldEntity[]>
    get(id: string): Promise<WorldEntity>
    save(entity: WorldEntity): Promise<WorldEntity>
    delete(id: string): Promise<void>
  }

  export(campaignId: string): Promise<CampaignArchive>
  import(archive: CampaignArchive): Promise<Campaign>

  readonly type: 'local' | 'cloud'
  readonly supportsRealtime: boolean
  readonly requiresAuth: boolean
}
