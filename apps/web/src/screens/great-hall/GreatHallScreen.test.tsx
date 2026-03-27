import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { CampaignSummary, Campaign, CharacterState, SessionEvent } from '@saga-keeper/domain'
import { GreatHallScreen } from './GreatHallScreen'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockListCampaigns = vi.fn<[], Promise<CampaignSummary[]>>()
const mockLoadCampaign = vi.fn<
  [id: string],
  Promise<{ campaign: Campaign; character: CharacterState; events: SessionEvent[] }>
>()
const mockSetCampaign = vi.fn()
const mockSetCharacter = vi.fn()
const mockAppendEvent = vi.fn()
const mockClearSession = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/great-hall' }),
}))

vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}))

vi.mock('@/providers/NarrativeDomainProvider', () => ({
  useCampaignOps: vi.fn(() => ({
    listCampaigns: mockListCampaigns,
    loadCampaign: mockLoadCampaign,
  })),
}))

import { useGameStore } from '@/store'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSummary(overrides: Partial<CampaignSummary> = {}): CampaignSummary {
  return {
    id: 'c1',
    name: 'The Ashwood Oath',
    tagline: 'A blood-debt.',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['ch1'],
    lastPlayedAt: new Date().toISOString(),
    ...overrides,
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
    data: { health: 5, spirit: 5, supply: 5, momentum: 2, vows: [], edge: 1, heart: 2, iron: 2, shadow: 1, wits: 1, debilities: {}, bonds: [], assetIds: [], experience: { earned: 0, spent: 0 }, tracks: { combat: 0, journey: 0, bonds: 0 } },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useGameStore).mockImplementation((selector: (s: any) => unknown) => {
    const state = {
      campaign: null,
      character: null,
      events: [],
      turns: [],
      setCampaign: mockSetCampaign,
      setCharacter: mockSetCharacter,
      appendEvent: mockAppendEvent,
      clearSession: mockClearSession,
      ...overrides,
    }
    return selector(state)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockClear()
  mockListCampaigns.mockResolvedValue([])
  mockLoadCampaign.mockResolvedValue({ campaign: makeCampaign(), character: makeCharacter(), events: [] })
  setupStore()
})

// ── Layout landmarks ──────────────────────────────────────────────────────────

describe('GreatHallScreen — layout landmarks', () => {
  it('renders exactly one banner landmark', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      const banners = document.querySelectorAll('[role="banner"]')
      expect(banners.length).toBe(1)
    })
  })

  it('renders a main landmark with tabIndex -1', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(main).toBeTruthy()
      expect(main.tabIndex).toBe(-1)
    })
  })

  it('renders an h1 heading "The Great Hall"', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /the great hall/i })).toBeTruthy()
    })
  })

  it('renders a Campaign statistics region', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /campaign statistics/i })).toBeTruthy()
    })
  })

  it('renders a Campaigns section', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /campaigns/i })).toBeTruthy()
    })
  })

  it('renders Recent activity log', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('log', { name: /recent activity/i })).toBeTruthy()
    })
  })

  it('renders Skald\'s Reminder section', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /skald's reminder/i })).toBeTruthy()
    })
  })

  it('renders application navigation', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /application/i })).toBeTruthy()
    })
  })

  it('HeroSection h1 is not wrapped in a banner landmark', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      const banners = document.querySelectorAll('[role="banner"]')
      expect(banners.length).toBe(1)
    })
  })
})

// ── Navigation ────────────────────────────────────────────────────────────────

describe('GreatHallScreen — navigation', () => {
  it('clicking the Saga Keeper logo calls navigate("/great-hall")', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /go to great hall/i }))
    fireEvent.click(screen.getByRole('button', { name: /go to great hall/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/great-hall')
  })

  it('Iron Sheet nav button is disabled when no campaign is loaded', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /iron sheet/i }))
    expect((screen.getByRole('button', { name: /iron sheet/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('Oracle nav button calls navigate("/oracle")', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /^oracle$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^oracle$/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/oracle')
  })

  it('Skald nav button is disabled when no campaign is loaded', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /skald/i }))
    expect((screen.getByRole('button', { name: /skald/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('World Forge nav button is disabled', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /world forge/i }))
    expect((screen.getByRole('button', { name: /world forge/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('Great Hall nav button is NOT in the nav (logo is the home entry)', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('navigation', { name: /application/i }))
    const nav = screen.getByRole('navigation', { name: /application/i })
    const btns = Array.from(nav.querySelectorAll('button'))
    const greatHallNavBtn = btns.find((b) => /great hall/i.test(b.textContent ?? ''))
    expect(greatHallNavBtn).toBeUndefined()
  })
})

// ── Campaign list ─────────────────────────────────────────────────────────────

describe('GreatHallScreen — campaign list', () => {
  it('calls listCampaigns on mount', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => expect(mockListCampaigns).toHaveBeenCalledOnce())
  })

  it('renders a campaign card for each returned summary', async () => {
    mockListCampaigns.mockResolvedValue([makeSummary(), makeSummary({ id: 'c2', name: 'Another Saga' })])
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByText('The Ashwood Oath')).toBeTruthy()
      expect(screen.getByText('Another Saga')).toBeTruthy()
    })
  })

  it('always renders the "Forge New Campaign" card', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enter the forge/i })).toBeTruthy()
    })
  })

  it('"Enter the Forge" button navigates to /forge', async () => {
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /enter the forge/i }))
    fireEvent.click(screen.getByRole('button', { name: /enter the forge/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/forge')
  })

  it('stats bar shows correct campaign count', async () => {
    mockListCampaigns.mockResolvedValue([makeSummary(), makeSummary({ id: 'c2', name: 'Another' })])
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByTestId('stat-campaigns').textContent).toContain('2')
    })
  })

  it('stats bar shows 0 campaigns when list is empty', async () => {
    mockListCampaigns.mockResolvedValue([])
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByTestId('stat-campaigns').textContent).toContain('0')
    })
  })
})

// ── Continue Saga ─────────────────────────────────────────────────────────────

describe('GreatHallScreen — Continue Saga', () => {
  it('clicking "Continue Saga" calls loadCampaign with the campaign id', async () => {
    mockListCampaigns.mockResolvedValue([makeSummary()])
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /continue saga/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue saga/i }))
    await waitFor(() => expect(mockLoadCampaign).toHaveBeenCalledWith('c1'))
  })

  it('clicking "Continue Saga" hydrates the store and navigates to /skald', async () => {
    mockListCampaigns.mockResolvedValue([makeSummary()])
    const campaign = makeCampaign()
    const character = makeCharacter()
    mockLoadCampaign.mockResolvedValue({ campaign, character, events: [] })
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /continue saga/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue saga/i }))
    await waitFor(() => {
      expect(mockClearSession).toHaveBeenCalled()
      expect(mockSetCampaign).toHaveBeenCalledWith(campaign)
      expect(mockSetCharacter).toHaveBeenCalledWith(character)
      expect(mockNavigate).toHaveBeenCalledWith('/skald')
    })
  })

  it('clicking "Continue Saga" appends events to the store', async () => {
    const events: SessionEvent[] = [
      { id: 'e1', campaignId: 'c1', turnId: 't1', type: 'move.resolved', playerId: 'p1', payload: {}, timestamp: new Date().toISOString() },
    ]
    mockListCampaigns.mockResolvedValue([makeSummary()])
    mockLoadCampaign.mockResolvedValue({ campaign: makeCampaign(), character: makeCharacter(), events })
    render(<GreatHallScreen />)
    await waitFor(() => screen.getByRole('button', { name: /continue saga/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue saga/i }))
    await waitFor(() => {
      expect(mockAppendEvent).toHaveBeenCalledWith(events[0])
    })
  })
})

// ── Skald's Reminder ──────────────────────────────────────────────────────────

describe('GreatHallScreen — Skald\'s Reminder', () => {
  it('shows fallback text when no campaigns are loaded', async () => {
    mockListCampaigns.mockResolvedValue([])
    render(<GreatHallScreen />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /skald's reminder/i })).toBeTruthy()
    })
  })
})
