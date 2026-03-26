import { describe, it, expect } from 'vitest'
import { formatRelativeDate } from './formatRelativeDate'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

describe('formatRelativeDate', () => {
  it('returns empty string for undefined', () => {
    expect(formatRelativeDate(undefined)).toBe('')
  })

  it('returns "Today" for a timestamp from earlier today', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Today')
  })

  it('returns "Yesterday" for 1 day ago', () => {
    expect(formatRelativeDate(daysAgo(1))).toBe('Yesterday')
  })

  it('returns "2 days ago" for 2 days ago', () => {
    expect(formatRelativeDate(daysAgo(2))).toBe('2 days ago')
  })

  it('returns "6 days ago" for 6 days ago', () => {
    expect(formatRelativeDate(daysAgo(6))).toBe('6 days ago')
  })

  it('returns "1 week ago" for 7 days ago', () => {
    expect(formatRelativeDate(daysAgo(7))).toBe('1 week ago')
  })

  it('returns "2 weeks ago" for 14 days ago', () => {
    expect(formatRelativeDate(daysAgo(14))).toBe('2 weeks ago')
  })

  it('returns weeks for larger values', () => {
    expect(formatRelativeDate(daysAgo(30))).toBe('4 weeks ago')
  })
})
