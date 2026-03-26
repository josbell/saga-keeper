import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { SkaldScreen } from './SkaldScreen'
import { useGameStore } from '@/store'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/skald' }),
}))

vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}))

vi.mock('@/providers/NarrativeDomainProvider', () => ({
  useNarrativeDomain: vi.fn(() => ({ processTurn: vi.fn() })),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useGameStore).mockImplementation((selector: (s: any) => unknown) => {
    const state = {
      messages: [],
      phase: 'idle',
      streamBuffer: '',
      character: null,
      campaign: null,
      turns: [],
      pendingAction: null,
      draft: { tableId: null, odds: null },
      lastFates: null,
      lastResult: null,
      history: [],
      fatesHistory: [],
      setDraft: vi.fn(),
      recordFates: vi.fn(),
      recordOracleRoll: vi.fn(),
      appendMessage: vi.fn(),
      setPhase: vi.fn(),
      setPendingAction: vi.fn(),
      applyTurnResult: vi.fn(),
      ...overrides,
    }
    return selector(state)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockClear()
  setupStore()
})

describe('SkaldScreen — layout landmarks', () => {
  it('renders a banner landmark', () => {
    render(<SkaldScreen />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('renders navigation with aria-label "Application"', () => {
    render(<SkaldScreen />)
    expect(screen.getByRole('navigation', { name: /application/i })).toBeTruthy()
  })

  it('Skald nav button has aria-current="page"', () => {
    render(<SkaldScreen />)
    const nav = screen.getByRole('navigation', { name: /application/i })
    const activeBtn = nav.querySelector('[aria-current="page"]')
    expect(activeBtn).toBeTruthy()
    expect(activeBtn!.textContent).toMatch(/skald/i)
  })

  it('Iron Sheet nav button does not have aria-current', () => {
    render(<SkaldScreen />)
    const ironSheetBtn = screen.getByRole('button', { name: /iron sheet/i })
    expect(ironSheetBtn.getAttribute('aria-current')).toBeNull()
  })

  it('clicking Iron Sheet calls navigate("/iron-sheet")', () => {
    render(<SkaldScreen />)
    fireEvent.click(screen.getByRole('button', { name: /iron sheet/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/iron-sheet')
  })

  it('clicking Oracle nav button calls navigate("/oracle")', () => {
    render(<SkaldScreen />)
    const nav = screen.getByRole('navigation', { name: /application/i })
    fireEvent.click(within(nav).getByRole('button', { name: /^oracle$/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/oracle')
  })

  it('renders main landmark with tabIndex -1', () => {
    render(<SkaldScreen />)
    const main = screen.getByRole('main')
    expect(main).toBeTruthy()
    expect(main.tabIndex).toBe(-1)
  })

  it('renders left aside with aria-label "Character & Sessions"', () => {
    render(<SkaldScreen />)
    expect(
      screen.getByRole('complementary', { name: /character & sessions/i }),
    ).toBeTruthy()
  })

  it('renders right aside with aria-label "Scene & Moves"', () => {
    render(<SkaldScreen />)
    expect(screen.getByRole('complementary', { name: /scene & moves/i })).toBeTruthy()
  })

  it('renders logo text "Saga Keeper"', () => {
    render(<SkaldScreen />)
    expect(screen.getByText(/saga keeper/i)).toBeTruthy()
  })

  it('renders h1 heading "The Skald"', () => {
    render(<SkaldScreen />)
    expect(screen.getByRole('heading', { level: 1, name: /the skald/i })).toBeTruthy()
  })
})

describe('SkaldScreen — accessibility', () => {
  it('clicking the logo navigates to /great-hall', () => {
    render(<SkaldScreen />)
    fireEvent.click(screen.getByRole('button', { name: /go to great hall/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/great-hall')
  })

  it('World Forge nav button is disabled', () => {
    render(<SkaldScreen />)
    const worldForgeBtn = screen.getByRole('button', { name: /world forge/i })
    expect((worldForgeBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('Skald nav button is not disabled', () => {
    render(<SkaldScreen />)
    const nav = screen.getByRole('navigation', { name: /application/i })
    const activeBtn = nav.querySelector('[aria-current="page"]') as HTMLButtonElement
    expect(activeBtn.disabled).toBe(false)
  })
})
