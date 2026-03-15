// ── Campaign domain types ─────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'complete' | 'abandoned'
export type CampaignMode = 'solo' | 'coop-same-pc' | 'coop-remote'

export interface Campaign {
  id: string
  name: string
  tagline?: string
  rulesetId: string
  status: CampaignStatus
  mode: CampaignMode
  characterIds: string[]
  /** ID of the player who created the campaign — owns cloud sync */
  ownerId?: string
  /** Invite code for remote co-op */
  shareCode?: string
  lastPlayedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CampaignSummary {
  id: string
  name: string
  tagline?: string
  rulesetId: string
  status: CampaignStatus
  mode: CampaignMode
  characterIds: string[]
  lastPlayedAt?: string
}

export interface NewCampaign {
  name: string
  tagline?: string
  rulesetId: string
  mode: CampaignMode
}
