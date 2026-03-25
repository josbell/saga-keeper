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

  it('clicking Iron Sheet nav calls navigate with /iron-sheet', () => {
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

  it('Skald nav button is enabled and navigates to /skald', () => {
    render(<OracleScreen />)
    const skaldBtn = screen.getByRole('button', { name: /skald/i })
    expect((skaldBtn as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(skaldBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/skald')
  })
})
