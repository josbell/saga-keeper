import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { NarrativeDomain, OracleService, DiceService, type INarrativeDomain } from '@saga-keeper/services'
import { LocalAdapter } from '@saga-keeper/storage'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { Campaign, CampaignSummary, CharacterState, SessionEvent } from '@saga-keeper/domain'
import { OfflineAIGateway } from './OfflineAIGateway'

// ── Context ───────────────────────────────────────────────────────────────────

interface NarrativeDomainContextValue {
  narrativeDomain: INarrativeDomain
  persistSetup: (campaign: Campaign, character: CharacterState) => Promise<void>
  listCampaigns: () => Promise<CampaignSummary[]>
  loadCampaign: (
    campaignId: string,
  ) => Promise<{ campaign: Campaign; character: CharacterState; events: SessionEvent[] }>
}

const NarrativeDomainContext = createContext<NarrativeDomainContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

interface NarrativeDomainProviderProps {
  children: ReactNode
}

/**
 * Constructs the NarrativeDomain dependency graph once (via useMemo) and
 * exposes it to the component tree via context.
 *
 * Architecture notes:
 * - DiceService is a singleton object — NOT a class; do not call `new DiceService()`
 * - OracleService takes `rand?: () => number` — constructed with no args (uses Math.random)
 * - OfflineAIGateway.getTier() returns 'offline'; NarrativeDomain skips AI calls entirely
 */
export function NarrativeDomainProvider({ children }: NarrativeDomainProviderProps) {
  const ctx = useMemo(() => {
    const storage = new LocalAdapter()
    const oracle = new OracleService()
    const ai = new OfflineAIGateway()
    // DiceService is a plain object (not a class) — pass the singleton directly
    const narrativeDomain = new NarrativeDomain(storage, ironswornPlugin, ai, oracle, DiceService)

    async function persistSetup(campaign: Campaign, character: CharacterState): Promise<void> {
      await storage.import({
        version: '1',
        exportedAt: new Date().toISOString(),
        rulesetId: campaign.rulesetId,
        campaign,
        characters: [character],
        world: [],
        sessionLog: [],
      })
    }

    async function listCampaigns(): Promise<CampaignSummary[]> {
      return storage.campaigns.list()
    }

    async function loadCampaign(
      campaignId: string,
    ): Promise<{ campaign: Campaign; character: CharacterState; events: SessionEvent[] }> {
      const campaign = await storage.campaigns.get(campaignId)
      const character = await storage.characters.get(campaign.characterIds[0]!)
      const events = await storage.session.getRecent(campaignId, 20)
      return { campaign, character, events }
    }

    return { narrativeDomain, persistSetup, listCampaigns, loadCampaign }
  }, [])

  return (
    <NarrativeDomainContext.Provider value={ctx}>
      {children}
    </NarrativeDomainContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns the INarrativeDomain instance from context.
 * Must be called inside a NarrativeDomainProvider.
 */
export function useNarrativeDomain(): INarrativeDomain {
  const ctx = useContext(NarrativeDomainContext)
  if (!ctx) {
    throw new Error('useNarrativeDomain must be called inside a <NarrativeDomainProvider>')
  }
  return ctx.narrativeDomain
}

export function useCampaignOps(): Pick<NarrativeDomainContextValue, 'listCampaigns' | 'loadCampaign'> {
  const ctx = useContext(NarrativeDomainContext)
  if (!ctx) {
    throw new Error('useCampaignOps must be called inside a <NarrativeDomainProvider>')
  }
  return { listCampaigns: ctx.listCampaigns, loadCampaign: ctx.loadCampaign }
}

export function usePersistSetup(): (campaign: Campaign, character: CharacterState) => Promise<void> {
  const ctx = useContext(NarrativeDomainContext)
  if (!ctx) {
    throw new Error('usePersistSetup must be called inside a <NarrativeDomainProvider>')
  }
  return ctx.persistSetup
}
