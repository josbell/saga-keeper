import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OracleScreen } from './OracleScreen'
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

describe('OracleScreen — layout', () => {
  it('renders a header landmark', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('renders Application nav with aria-label', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('navigation', { name: /application/i })).toBeTruthy()
  })

  it('Oracle nav button has aria-current="page"', () => {
    render(<OracleScreen />)
    const nav = screen.getByRole('navigation', { name: /application/i })
    const activeBtn = nav.querySelector('[aria-current="page"]')
    expect(activeBtn).toBeTruthy()
    expect(activeBtn!.textContent).toMatch(/oracle/i)
  })

  it('Iron Sheet nav button does not have aria-current', () => {
    render(<OracleScreen />)
    const ironSheetBtn = screen.getByRole('button', { name: /iron sheet/i })
    expect(ironSheetBtn.getAttribute('aria-current')).toBeNull()
  })

  it('Iron Sheet nav button is disabled when no campaign is loaded', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('button', { name: /iron sheet/i })).toHaveProperty('disabled', true)
  })

  it('clicking Iron Sheet nav calls navigate with /iron-sheet when campaign is loaded', () => {
    useGameStore.setState({
      campaign: {
        id: 'c1',
        name: 'Test',
        rulesetId: 'ironsworn-v1',
        status: 'active' as const,
        mode: 'solo' as const,
        characterIds: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    render(<OracleScreen />)
    fireEvent.click(screen.getByRole('button', { name: /iron sheet/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/iron-sheet')
  })

  it('renders main landmark with tabIndex -1', () => {
    render(<OracleScreen />)
    const main = screen.getByRole('main')
    expect(main).toBeTruthy()
    expect(main.tabIndex).toBe(-1)
  })

  it('renders Oracle Tables aside', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('complementary', { name: /oracle tables/i })).toBeTruthy()
  })

  it('renders Recent Revelations aside', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('complementary', { name: /recent revelations/i })).toBeTruthy()
  })

  it('renders Oracle h1 heading', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('heading', { level: 1, name: /oracle/i })).toBeTruthy()
  })
})

describe('OracleScreen — accessibility', () => {
  it('logo text "Saga Keeper" is present', () => {
    render(<OracleScreen />)
    expect(screen.getByText(/saga keeper/i)).toBeTruthy()
  })

  it('clicking the logo navigates to /great-hall', () => {
    render(<OracleScreen />)
    fireEvent.click(screen.getByRole('button', { name: /go to great hall/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/great-hall')
  })

  it('Skald nav button is disabled when no campaign is loaded', () => {
    render(<OracleScreen />)
    expect(screen.getByRole('button', { name: /skald/i })).toHaveProperty('disabled', true)
  })
})
