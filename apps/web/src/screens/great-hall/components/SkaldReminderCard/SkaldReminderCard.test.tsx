import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkaldReminderCard } from './SkaldReminderCard'

describe('SkaldReminderCard', () => {
  it('renders a section with aria-label "Skald\'s Reminder"', () => {
    render(<SkaldReminderCard reminderText={null} />)
    expect(screen.getByRole('region', { name: /skald's reminder/i })).toBeTruthy()
  })

  it('renders the label text "Skald\'s Reminder"', () => {
    render(<SkaldReminderCard reminderText={null} />)
    expect(screen.getByText(/skald's reminder/i)).toBeTruthy()
  })

  it('renders the provided reminderText', () => {
    render(<SkaldReminderCard reminderText="Your character is in a dire state." />)
    expect(screen.getByText(/dire state/i)).toBeTruthy()
  })

  it('renders fallback text when reminderText is null', () => {
    render(<SkaldReminderCard reminderText={null} />)
    expect(screen.getByText(/begin a new saga/i)).toBeTruthy()
  })

  it('does not render fallback when reminderText is provided', () => {
    render(<SkaldReminderCard reminderText="Your saga continues." />)
    expect(screen.queryByText(/begin a new saga/i)).toBeNull()
  })
})
