import { describe, it, expect } from 'vitest'
import { buildEventUserPrompt } from './buildEventUserPrompt'
import type { EventGenerationContext } from '@saga-keeper/domain'

const FULL_CTX: EventGenerationContext = {
  scene: 'A fog-shrouded forest crossing at dusk',
  vow: 'Deliver the message to the Iron Council',
}

const SCENE_ONLY_CTX: EventGenerationContext = {
  scene: 'A crumbling watchtower on the coast',
}

describe('buildEventUserPrompt — always-present content', () => {
  it('includes the scene text', () => {
    const out = buildEventUserPrompt(FULL_CTX)
    expect(out).toContain('A fog-shrouded forest crossing at dusk')
  })

  it('includes "Current scene:" label', () => {
    const out = buildEventUserPrompt(FULL_CTX)
    expect(out).toContain('Current scene:')
  })

  it('includes the JSON instruction line', () => {
    const out = buildEventUserPrompt(FULL_CTX)
    expect(out).toContain('trigger, complication, opportunity, oracle_hint')
  })

  it('returns a non-empty string', () => {
    const out = buildEventUserPrompt(FULL_CTX)
    expect(out.length).toBeGreaterThan(0)
  })
})

describe('buildEventUserPrompt — vow field', () => {
  it('includes "Active vow:" when vow is provided', () => {
    const out = buildEventUserPrompt(FULL_CTX)
    expect(out).toContain('Active vow:')
    expect(out).toContain('Deliver the message to the Iron Council')
  })

  it('omits "Active vow:" when vow is not provided', () => {
    const out = buildEventUserPrompt(SCENE_ONLY_CTX)
    expect(out).not.toContain('Active vow:')
  })
})
