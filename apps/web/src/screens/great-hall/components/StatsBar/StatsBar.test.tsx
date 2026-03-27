import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsBar } from './StatsBar'

const defaultProps = {
  campaigns: 3,
  characters: 4,
  vowsSworn: 12,
  vowsFulfilled: 7,
  sessionsPlayed: 34,
}

describe('StatsBar', () => {
  it('renders a region with aria-label "Campaign statistics"', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByRole('region', { name: /campaign statistics/i })).toBeTruthy()
  })

  it('renders exactly 5 stat blocks', () => {
    render(<StatsBar {...defaultProps} />)
    const region = screen.getByRole('region', { name: /campaign statistics/i })
    expect(region.querySelectorAll('[data-stat]').length).toBe(5)
  })

  it('renders all five labels', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByText(/campaigns/i)).toBeTruthy()
    expect(screen.getByText(/characters/i)).toBeTruthy()
    expect(screen.getByText(/vows sworn/i)).toBeTruthy()
    expect(screen.getByText(/vows fulfilled/i)).toBeTruthy()
    expect(screen.getByText(/sessions played/i)).toBeTruthy()
  })

  it('renders the numeric value for campaigns', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByTestId('stat-campaigns').textContent).toContain('3')
  })

  it('renders the numeric value for characters', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByTestId('stat-characters').textContent).toContain('4')
  })

  it('renders the numeric value for vowsSworn', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByTestId('stat-vows-sworn').textContent).toContain('12')
  })

  it('renders the numeric value for vowsFulfilled', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByTestId('stat-vows-fulfilled').textContent).toContain('7')
  })

  it('renders the numeric value for sessionsPlayed', () => {
    render(<StatsBar {...defaultProps} />)
    expect(screen.getByTestId('stat-sessions-played').textContent).toContain('34')
  })

  it('renders zero values correctly', () => {
    render(<StatsBar campaigns={0} characters={0} vowsSworn={0} vowsFulfilled={0} sessionsPlayed={0} />)
    const region = screen.getByRole('region', { name: /campaign statistics/i })
    const zeros = Array.from(region.querySelectorAll('[data-stat-val]')).filter(
      (el) => el.textContent === '0',
    )
    expect(zeros.length).toBe(5)
  })
})
