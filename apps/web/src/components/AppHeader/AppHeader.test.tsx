import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppHeader } from './AppHeader'
import { useGameStore } from '@/store'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/oracle' }),
}))

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState())
  mockNavigate.mockClear()
})

describe('AppHeader — structure', () => {
  it('renders a banner landmark', () => {
    render(<AppHeader />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('renders Application nav', () => {
    render(<AppHeader />)
    expect(screen.getByRole('navigation', { name: /application/i })).toBeTruthy()
  })

  it('renders "Saga Keeper" logo text', () => {
    render(<AppHeader />)
    expect(screen.getByText(/saga keeper/i)).toBeTruthy()
  })

  it('logo button has aria-label "Go to Great Hall"', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /go to great hall/i })).toBeTruthy()
  })
})

describe('AppHeader — navigation', () => {
  it('logo button navigates to /great-hall', () => {
    render(<AppHeader />)
    fireEvent.click(screen.getByRole('button', { name: /go to great hall/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/great-hall')
  })

  it('Oracle button navigates to /oracle', () => {
    render(<AppHeader />)
    fireEvent.click(screen.getByRole('button', { name: /oracle/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/oracle')
  })

  it('marks the current route as aria-current="page"', () => {
    render(<AppHeader />)
    const nav = screen.getByRole('navigation', { name: /application/i })
    const activeBtn = nav.querySelector('[aria-current="page"]')
    expect(activeBtn).toBeTruthy()
    expect(activeBtn!.textContent).toMatch(/oracle/i)
  })

  it('Skald button is disabled when no campaign is loaded', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /skald/i })).toHaveProperty('disabled', true)
  })

  it('World Forge button is disabled', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /world forge/i })).toHaveProperty('disabled', true)
  })
})

describe('AppHeader — session-gated tabs', () => {
  it('Iron Sheet button is disabled when no campaign is loaded', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /iron sheet/i })).toHaveProperty('disabled', true)
  })

  it('Skald button is disabled when no campaign is loaded', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /skald/i })).toHaveProperty('disabled', true)
  })

  it('Iron Sheet and Skald buttons are enabled when a campaign is loaded', () => {
    useGameStore.setState({
      campaign: {
        id: 'c1',
        name: 'Test Campaign',
        rulesetId: 'ironsworn-v1',
        status: 'active',
        mode: 'solo',
        characterIds: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /iron sheet/i })).toHaveProperty('disabled', false)
    expect(screen.getByRole('button', { name: /skald/i })).toHaveProperty('disabled', false)
    fireEvent.click(screen.getByRole('button', { name: /iron sheet/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/iron-sheet')
  })
})
