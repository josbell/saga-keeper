import { describe, it, expect } from 'vitest'
import { sessionEventsToActivityItems } from './sessionEventsToActivityItems'
import type { SessionEvent } from '@saga-keeper/domain'

function makeEvent(overrides: Partial<SessionEvent> = {}): SessionEvent {
  return {
    id: Math.random().toString(36).slice(2),
    campaignId: 'c1',
    turnId: 't1',
    type: 'move.resolved',
    playerId: 'p1',
    payload: {},
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('sessionEventsToActivityItems', () => {
  it('returns an empty array for empty input', () => {
    expect(sessionEventsToActivityItems([], 'My Campaign')).toEqual([])
  })

  it('maps oracle.consulted to gold dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'oracle.consulted' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('gold')
  })

  it('maps vow.updated to gold dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'vow.updated' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('gold')
  })

  it('maps entity.extracted to blue dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'entity.extracted' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('blue')
  })

  it('maps character.mutated to red dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'character.mutated' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('red')
  })

  it('maps move.resolved to dim dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'move.resolved' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('dim')
  })

  it('maps skald.narrated to dim dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'skald.narrated' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('dim')
  })

  it('maps player.input to dim dot', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'player.input' })], 'My Campaign')
    expect(items[0]?.dotColor).toBe('dim')
  })

  it('uses the event type as part of the title', () => {
    const items = sessionEventsToActivityItems([makeEvent({ type: 'oracle.consulted' })], 'My Campaign')
    expect(items[0]?.title).toBeTruthy()
    expect(typeof items[0]?.title).toBe('string')
  })

  it('includes campaign name in meta', () => {
    const items = sessionEventsToActivityItems([makeEvent()], 'My Campaign')
    expect(items[0]?.meta).toContain('My Campaign')
  })

  it('includes a relative date in meta', () => {
    const items = sessionEventsToActivityItems([makeEvent()], 'My Campaign')
    expect(items[0]?.meta).toMatch(/today|ago|yesterday/i)
  })

  it('sorts events newest first', () => {
    const older = makeEvent({ timestamp: '2026-01-01T00:00:00Z', type: 'move.resolved' })
    const newer = makeEvent({ timestamp: '2026-06-01T00:00:00Z', type: 'oracle.consulted' })
    const items = sessionEventsToActivityItems([older, newer], 'My Campaign')
    expect(items[0]?.dotColor).toBe('gold') // newer (oracle) is first
    expect(items[1]?.dotColor).toBe('dim')  // older (move) is second
  })

  it('limits output to 6 items', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      makeEvent({ id: `e${i}`, timestamp: new Date(Date.now() - i * 1000).toISOString() }),
    )
    expect(sessionEventsToActivityItems(events, 'My Campaign').length).toBe(6)
  })

  it('returns items with id, title, meta, dotColor fields', () => {
    const items = sessionEventsToActivityItems([makeEvent()], 'My Campaign')
    const item = items[0]!
    expect(typeof item.id).toBe('string')
    expect(typeof item.title).toBe('string')
    expect(typeof item.meta).toBe('string')
    expect(typeof item.dotColor).toBe('string')
  })
})
