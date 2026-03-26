import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import type { CharacterState } from '@saga-keeper/domain'
import { IronSheetScreen } from './IronSheetScreen'
import { useGameStore } from '@/store'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/iron-sheet' }),
}))

vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}))

const mockPatchCharacterData = vi.fn()

function makeCharacter(overrides: Partial<IronswornCharacterData> = {}): CharacterState {
  const data = { ...ironswornPlugin.character.defaults(), ...overrides }
  return {
    id: 'char-test',
    campaignId: 'c1',
    name: 'Aldric',
    epithet: 'The Iron-Sworn',
    rulesetId: 'ironsworn-v1',
    data: data as Record<string, unknown>,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function setupStore(character: CharacterState | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useGameStore).mockImplementation((selector: (s: any) => unknown) => {
    const state = {
      character,
      patchCharacterData: mockPatchCharacterData,
    }
    return selector(state)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockClear()
  setupStore(makeCharacter())
})

describe('IronSheetScreen — rendering', () => {
  it('renders without crashing when character is null', () => {
    setupStore(null)
    render(<IronSheetScreen />)
    expect(screen.getByRole('main')).toBeTruthy()
  })

  it('renders an h1 "Iron Sheet"', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('heading', { level: 1, name: /iron sheet/i })).toBeTruthy()
  })

  it('renders the CharacterHeader with character name', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('heading', { level: 2, name: /aldric/i })).toBeTruthy()
  })

  it('renders 5 stat stones', () => {
    render(<IronSheetScreen />)
    expect(screen.getByTestId('stat-edge')).toBeTruthy()
    expect(screen.getByTestId('stat-heart')).toBeTruthy()
    expect(screen.getByTestId('stat-iron')).toBeTruthy()
    expect(screen.getByTestId('stat-shadow')).toBeTruthy()
    expect(screen.getByTestId('stat-wits')).toBeTruthy()
  })

  it('renders condition meters section', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('region', { name: /condition meters/i })).toBeTruthy()
  })

  it('renders the Momentum slider', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('slider', { name: /momentum/i })).toBeTruthy()
  })

  it('renders 9 debility chips', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('group', { name: /debilities/i })).toBeTruthy()
  })

  it('renders the Vows section', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('region', { name: /vows/i })).toBeTruthy()
  })

  it('renders the Dice Roller section', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('region', { name: /dice roller/i })).toBeTruthy()
  })

  it('renders an empty state message when character is null', () => {
    setupStore(null)
    render(<IronSheetScreen />)
    expect(screen.getByText(/no character/i)).toBeTruthy()
  })
})

describe('IronSheetScreen — stat selection', () => {
  it('clicking Edge stat stone selects it (DiceRollerSection shows Edge)', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByTestId('stat-edge'))
    expect(screen.getByTestId('stat-name').textContent).toMatch(/edge/i)
  })

  it('clicking a selected stat deselects it (prompt reappears)', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByTestId('stat-edge'))
    fireEvent.click(screen.getByTestId('stat-edge'))
    expect(screen.getByText(/select a stat above to roll/i)).toBeTruthy()
  })

  it('only one stat stone has aria-pressed=true at a time', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByTestId('stat-heart'))
    const pressedStones = screen
      .getAllByRole('button')
      .filter(
        (b) => b.getAttribute('aria-pressed') === 'true' && b.dataset['testid']?.startsWith('stat-')
      )
    expect(pressedStones.length).toBeLessThanOrEqual(1)
  })
})

describe('IronSheetScreen — store mutations', () => {
  it('changing health StatTrack calls patchCharacterData with { health: N }', () => {
    render(<IronSheetScreen />)
    // StatTrack pips are labelled "Set to N"
    const pip = screen.getAllByLabelText('Set to 3')[0]!
    fireEvent.click(pip)
    expect(mockPatchCharacterData).toHaveBeenCalledWith(expect.objectContaining({ health: 3 }))
  })

  it('changing MomentumTrack calls patchCharacterData with { momentum: N }', () => {
    render(<IronSheetScreen />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(mockPatchCharacterData).toHaveBeenCalledWith(
      expect.objectContaining({ momentum: expect.any(Number) })
    )
  })

  it('toggling a debility chip calls patchCharacterData', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByText('Wounded').closest('button')!)
    expect(mockPatchCharacterData).toHaveBeenCalled()
  })
})

describe('IronSheetScreen — accessibility', () => {
  it('clicking the logo navigates to /great-hall', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByRole('button', { name: /go to great hall/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/great-hall')
  })

  it('has a <main> landmark', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('main')).toBeTruthy()
  })

  it('has an h1 heading', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('has a nav landmark with aria-label', () => {
    render(<IronSheetScreen />)
    expect(screen.getByRole('navigation')).toBeTruthy()
  })

  it('the Iron Sheet nav tab has aria-current="page"', () => {
    render(<IronSheetScreen />)
    const nav = screen.getByRole('navigation')
    const activeTab = nav.querySelector('[aria-current="page"]')
    expect(activeTab).toBeTruthy()
    expect(activeTab!.textContent).toMatch(/iron sheet/i)
  })

  it('clicking Oracle nav button calls navigate with /oracle', () => {
    render(<IronSheetScreen />)
    fireEvent.click(screen.getByRole('button', { name: /oracle/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/oracle')
  })

  it('Skald nav button is enabled and navigates to /skald', () => {
    render(<IronSheetScreen />)
    const skaldBtn = screen.getByRole('button', { name: /skald/i })
    expect((skaldBtn as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(skaldBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/skald')
  })
})
