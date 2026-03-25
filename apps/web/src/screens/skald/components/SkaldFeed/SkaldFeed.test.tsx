import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { SkaldMessage, TurnPhase } from '@/store/types'
import { SkaldFeed } from './SkaldFeed'

function makeMessage(overrides: Partial<SkaldMessage>): SkaldMessage {
  return {
    id: 'msg-1',
    role: 'skald',
    content: 'Test content',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function renderFeed(
  messages: SkaldMessage[] = [],
  phase: TurnPhase = 'idle',
  streamBuffer = '',
) {
  return render(<SkaldFeed messages={messages} phase={phase} streamBuffer={streamBuffer} />)
}

describe('SkaldFeed — structure', () => {
  it('renders a log region with aria-live="polite"', () => {
    renderFeed()
    const log = screen.getByRole('log')
    expect(log).toBeTruthy()
    expect(log.getAttribute('aria-live')).toBe('polite')
  })

  it('renders nothing when messages is empty', () => {
    renderFeed()
    const log = screen.getByRole('log')
    expect(log.querySelectorAll('[data-testid="skald-bubble"], [data-testid="player-bubble"]').length).toBe(0)
  })

  it('renders a skald message bubble with the content text', () => {
    renderFeed([makeMessage({ role: 'skald', content: 'The ravens fly north.' })])
    expect(screen.getByText('The ravens fly north.')).toBeTruthy()
  })

  it('renders a player message bubble with the content text', () => {
    renderFeed([makeMessage({ role: 'player', content: 'I charge forward.' })])
    expect(screen.getByText('I charge forward.')).toBeTruthy()
  })

  it('skald message avatar has aria-hidden="true"', () => {
    renderFeed([makeMessage({ role: 'skald' })])
    const log = screen.getByRole('log')
    const avatar = log.querySelector('[data-testid="skald-avatar"]')
    expect(avatar).toBeTruthy()
    expect(avatar!.getAttribute('aria-hidden')).toBe('true')
  })

  it('messages render oldest-first (top to bottom order)', () => {
    const messages = [
      makeMessage({ id: 'a', role: 'skald', content: 'First message' }),
      makeMessage({ id: 'b', role: 'player', content: 'Second message' }),
    ]
    renderFeed(messages)
    const log = screen.getByRole('log')
    const items = log.querySelectorAll('[data-testid="feed-item"]')
    expect(items.length).toBe(2)
    expect(items[0]!.textContent).toContain('First message')
    expect(items[1]!.textContent).toContain('Second message')
  })
})

describe('SkaldFeed — typing indicator', () => {
  it('shows typing indicator when phase is "waiting-for-ai"', () => {
    renderFeed([], 'waiting-for-ai')
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows typing indicator when phase is "streaming"', () => {
    renderFeed([], 'streaming')
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('hides typing indicator when phase is "idle"', () => {
    renderFeed([], 'idle')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('typing indicator has aria-label "The Skald is composing..."', () => {
    renderFeed([], 'waiting-for-ai')
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('The Skald is composing...')
  })
})

describe('SkaldFeed — streaming', () => {
  it('renders streamBuffer as a partial skald bubble when streaming', () => {
    renderFeed([], 'streaming', 'The wind whispers...')
    expect(screen.getByText('The wind whispers...')).toBeTruthy()
  })

  it('streamBuffer bubble absent when streamBuffer is empty', () => {
    renderFeed([], 'streaming', '')
    const log = screen.getByRole('log')
    const partials = log.querySelectorAll('[data-testid="stream-bubble"]')
    expect(partials.length).toBe(0)
  })
})

describe('SkaldFeed — error state', () => {
  it('shows error indicator when phase is "error"', () => {
    renderFeed([], 'error')
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('hides error indicator when phase is not "error"', () => {
    renderFeed([], 'idle')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
