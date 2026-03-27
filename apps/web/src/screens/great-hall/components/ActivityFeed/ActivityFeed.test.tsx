import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from './ActivityFeed'
import type { ActivityItem } from './ActivityFeed'

const items: ActivityItem[] = [
  { id: '1', title: 'Björn compelled Elder Halvard — Weak Hit', meta: 'The Ashwood Oath · Today', dotColor: 'gold' },
  { id: '2', title: 'Leif took 2 harm — Wounded debility applied', meta: 'Frozen Shore · Yesterday', dotColor: 'red' },
  { id: '3', title: 'Oracle consulted — Yes, but...', meta: 'The Ashwood Oath · Today', dotColor: 'gold' },
]

describe('ActivityFeed', () => {
  it('renders a log region with aria-label "Recent activity"', () => {
    render(<ActivityFeed items={items} />)
    expect(screen.getByRole('log', { name: /recent activity/i })).toBeTruthy()
  })

  it('renders one list item per activity item', () => {
    render(<ActivityFeed items={items} />)
    const log = screen.getByRole('log', { name: /recent activity/i })
    expect(log.querySelectorAll('[data-activity-item]').length).toBe(3)
  })

  it('renders item title text', () => {
    render(<ActivityFeed items={items} />)
    expect(screen.getByText(/Björn compelled/i)).toBeTruthy()
  })

  it('renders item meta text', () => {
    render(<ActivityFeed items={items} />)
    expect(screen.getByText(/Frozen Shore/i)).toBeTruthy()
  })

  it('sets data-color attribute on dot for each item', () => {
    render(<ActivityFeed items={items} />)
    const log = screen.getByRole('log', { name: /recent activity/i })
    const goldDots = log.querySelectorAll('[data-dot-color="gold"]')
    expect(goldDots.length).toBe(2)
    const redDots = log.querySelectorAll('[data-dot-color="red"]')
    expect(redDots.length).toBe(1)
  })

  it('renders "No recent activity" when items is empty', () => {
    render(<ActivityFeed items={[]} />)
    expect(screen.getByText(/no recent activity/i)).toBeTruthy()
  })

  it('does not render the empty-state message when items are present', () => {
    render(<ActivityFeed items={items} />)
    expect(screen.queryByText(/no recent activity/i)).toBeNull()
  })
})
