import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { NarrativeDomainProvider, useCampaignOps } from './NarrativeDomainProvider'
import type { CampaignSummary, Campaign, CharacterState, SessionEvent } from '@saga-keeper/domain'

// ── Storage mock setup ────────────────────────────────────────────────────────

const mockList: Mock = vi.fn()
const mockCampaignGet: Mock = vi.fn()
const mockCharacterGet: Mock = vi.fn()
const mockSessionGetRecent: Mock = vi.fn()

vi.mock('@saga-keeper/storage', () => ({
  LocalAdapter: vi.fn(() => ({
    campaigns: {
      list: mockList,
      get: mockCampaignGet,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    characters: { get: mockCharacterGet, save: vi.fn() },
    session: {
      getRecent: mockSessionGetRecent,
      append: vi.fn(),
      appendBatch: vi.fn(),
      getAll: vi.fn(),
    },
    world: { list: vi.fn(), get: vi.fn(), save: vi.fn(), delete: vi.fn() },
    export: vi.fn(),
    import: vi.fn(async () => makeCampaign()),
  })),
}))

vi.mock('@saga-keeper/services', () => ({
  NarrativeDomain: vi.fn(() => ({ processTurn: vi.fn() })),
  OracleService: vi.fn(() => ({})),
  DiceService: {},
}))

vi.mock('@saga-keeper/ruleset-ironsworn', () => ({
  ironswornPlugin: {},
}))

vi.mock('./OfflineAIGateway', () => ({
  OfflineAIGateway: vi.fn(() => ({
    getTier: () => 'offline',
    getCapabilities: () => ({ localOnly: true, streaming: false, maxContextTokens: 0, supportsSystemPrompt: false }),
    complete: vi.fn(),
    stream: vi.fn(),
  })),
}))

// ── Test fixtures ─────────────────────────────────────────────────────────────

function makeSummary(): CampaignSummary {
  return {
    id: 'c1',
    name: 'The Ashwood Oath',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['ch1'],
  }
}

function makeCampaign(): Campaign {
  return {
    id: 'c1',
    name: 'The Ashwood Oath',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['ch1'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

function makeCharacter(): CharacterState {
  return {
    id: 'ch1',
    campaignId: 'c1',
    name: 'Björn',
    rulesetId: 'ironsworn-v1',
    data: {},
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NarrativeDomainProvider>{children}</NarrativeDomainProvider>
)

beforeEach(() => {
  vi.clearAllMocks()
  mockList.mockResolvedValue([])
  mockCampaignGet.mockResolvedValue(makeCampaign())
  mockCharacterGet.mockResolvedValue(makeCharacter())
  mockSessionGetRecent.mockResolvedValue([])
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCampaignOps — listCampaigns', () => {
  it('returns the list from storage', async () => {
    const summaries: CampaignSummary[] = [makeSummary()]
    mockList.mockResolvedValueOnce(summaries)
    const { result } = renderHook(() => useCampaignOps(), { wrapper })
    const list = await result.current.listCampaigns()
    expect(mockList).toHaveBeenCalledOnce()
    expect(list).toEqual(summaries)
  })

  it('returns an empty array when storage has no campaigns', async () => {
    mockList.mockResolvedValueOnce([])
    const { result } = renderHook(() => useCampaignOps(), { wrapper })
    const list = await result.current.listCampaigns()
    expect(list).toEqual([])
  })
})

describe('useCampaignOps — loadCampaign', () => {
  it('fetches campaign, first character, and recent events', async () => {
    const campaign = makeCampaign()
    const character = makeCharacter()
    const events: SessionEvent[] = []
    mockCampaignGet.mockResolvedValueOnce(campaign)
    mockCharacterGet.mockResolvedValueOnce(character)
    mockSessionGetRecent.mockResolvedValueOnce(events)

    const { result } = renderHook(() => useCampaignOps(), { wrapper })
    const loaded = await result.current.loadCampaign('c1')

    expect(mockCampaignGet).toHaveBeenCalledWith('c1')
    expect(mockCharacterGet).toHaveBeenCalledWith('ch1')
    expect(mockSessionGetRecent).toHaveBeenCalledWith('c1', 20)
    expect(loaded.campaign).toEqual(campaign)
    expect(loaded.character).toEqual(character)
    expect(loaded.events).toEqual(events)
  })
})

describe('useCampaignOps — outside provider', () => {
  it('throws when called outside NarrativeDomainProvider', () => {
    function Thrower() {
      try {
        useCampaignOps()
        return <div>no error</div>
      } catch (e) {
        return <div data-testid="error">{(e as Error).message}</div>
      }
    }
    render(<Thrower />)
    expect(screen.getByTestId('error').textContent).toMatch(/useCampaignOps must be called inside/i)
  })
})
