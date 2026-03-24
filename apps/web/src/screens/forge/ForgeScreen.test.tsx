import { render, screen, fireEvent } from '@testing-library/react'
import { ForgeScreen } from './ForgeScreen'
import { useGameStore } from '@/store'
import type { ForgeDraft } from './types'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'

// A draft that satisfies ironswornPlugin.creation.validate
const VALID_DRAFT: ForgeDraft = {
  worldDescription: 'A harsh land of iron and stone.',
  name: 'Björn',
  background: 'A wandering warrior seeking purpose.',
  edge: 3,
  heart: 2,
  iron: 2,
  shadow: 1,
  wits: 1,
  assetIds: ironswornPlugin.assets
    .getAll()
    .slice(0, 3)
    .map((a) => a.id),
  vow: {
    id: 'vow-test',
    title: 'Become a legend',
    rank: 'epic',
    progress: 0,
    fulfilled: false,
  },
}

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState())
})

const STEP_TITLES = [
  'Your World',
  'Who Are You?',
  'Your Stats',
  'Your Assets',
  'Your Starting Vow',
  'Enter the Ironlands',
]

describe('ForgeScreen — rendering', () => {
  it('renders the first step title "Your World"', () => {
    render(<ForgeScreen />)
    expect(screen.getByText('Your World')).toBeTruthy()
  })

  it('renders a progress indicator showing step 1 of 6', () => {
    render(<ForgeScreen />)
    expect(screen.getByText('1 / 6')).toBeTruthy()
  })

  it('renders a Next button', () => {
    render(<ForgeScreen />)
    expect(screen.getByRole('button', { name: /next/i })).toBeTruthy()
  })

  it('does not render a Back button on step 1', () => {
    render(<ForgeScreen />)
    expect(screen.queryByRole('button', { name: /back/i })).toBeNull()
  })
})

describe('ForgeScreen — navigation', () => {
  it('advances to step 2 when Next is clicked on step 1', () => {
    render(<ForgeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Who Are You?')).toBeTruthy()
  })

  it('renders a Back button on step 2', () => {
    render(<ForgeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /back/i })).toBeTruthy()
  })

  it('returns to step 1 when Back is clicked on step 2', () => {
    render(<ForgeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Your World')).toBeTruthy()
  })

  it('advances through all 6 steps sequentially', () => {
    render(<ForgeScreen />)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByText('Enter the Ironlands')).toBeTruthy()
  })

  it('does not advance past step 6', () => {
    render(<ForgeScreen />)
    for (let i = 0; i < 10; i++) {
      const next = screen.queryByRole('button', { name: /next/i })
      if (next) fireEvent.click(next)
    }
    expect(screen.getByText('Enter the Ironlands')).toBeTruthy()
    expect(screen.getByText('6 / 6')).toBeTruthy()
  })

  it('renders the correct step title at each index', () => {
    render(<ForgeScreen />)
    for (let i = 0; i < STEP_TITLES.length; i++) {
      expect(screen.getByText(STEP_TITLES[i]!)).toBeTruthy()
      if (i < STEP_TITLES.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: /next/i }))
      }
    }
  })
})

describe('ForgeScreen — store commit', () => {
  function navigateToConfirmation() {
    render(<ForgeScreen initialDraft={VALID_DRAFT} />)
    // Navigate through steps 1-5 using the shell Next button
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    // Step 6 (Confirmation) — click "Begin your journey"
    fireEvent.click(screen.getByRole('button', { name: /begin your journey/i }))
  }

  it('calls setCharacter on confirmation — character is not null', () => {
    navigateToConfirmation()
    expect(useGameStore.getState().character).not.toBeNull()
  })

  it('committed character has rulesetId "ironsworn-v1"', () => {
    navigateToConfirmation()
    expect(useGameStore.getState().character?.rulesetId).toBe('ironsworn-v1')
  })

  it('committed character id is a non-empty string', () => {
    navigateToConfirmation()
    const id = useGameStore.getState().character?.id
    expect(typeof id).toBe('string')
    expect((id ?? '').length).toBeGreaterThan(0)
  })

  it('committed character.data contains assetIds', () => {
    navigateToConfirmation()
    const data = useGameStore.getState().character?.data as Record<string, unknown>
    expect(Array.isArray(data?.assetIds)).toBe(true)
  })

  it('committed character.data has health: 5 from defaults', () => {
    navigateToConfirmation()
    const data = useGameStore.getState().character?.data as Record<string, unknown>
    expect(data?.health).toBe(5)
  })
})
