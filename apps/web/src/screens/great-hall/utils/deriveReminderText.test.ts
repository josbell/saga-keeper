import { describe, it, expect } from 'vitest'
import { deriveReminderText } from './deriveReminderText'
import type { Campaign, CharacterState } from '@saga-keeper/domain'
import type { IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'

function makeCampaign(): Campaign {
  return {
    id: 'c1',
    name: 'The Ashwood Oath',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['ch1'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

function makeCharacter(dataOverrides: Partial<IronswornCharacterData> = {}): CharacterState {
  const data: IronswornCharacterData = {
    edge: 1, heart: 2, iron: 2, shadow: 1, wits: 1,
    health: 5, spirit: 5, supply: 5, momentum: 2,
    debilities: { wounded: false, shaken: false, unprepared: false, encumbered: false, maimed: false, corrupted: false, cursed: false, tormented: false, weak: false },
    vows: [],
    bonds: [],
    assetIds: [],
    experience: { earned: 0, spent: 0 },
    tracks: { combat: 0, journey: 0, bonds: 0 },
    ...dataOverrides,
  }
  return {
    id: 'ch1',
    campaignId: 'c1',
    name: 'Björn',
    rulesetId: 'ironsworn-v1',
    data: data as unknown as Record<string, unknown>,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

describe('deriveReminderText', () => {
  it('returns null when there is no campaign', () => {
    expect(deriveReminderText(null, null)).toBeNull()
  })

  it('returns null when campaign is null even with a character', () => {
    expect(deriveReminderText(null, makeCharacter())).toBeNull()
  })

  it('returns a non-null string when campaign exists but character is null', () => {
    const text = deriveReminderText(makeCampaign(), null)
    expect(text).not.toBeNull()
    expect(typeof text).toBe('string')
  })

  it('warns about dire state when health < 2', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ health: 1 }))
    expect(text).toMatch(/dire/i)
  })

  it('warns about dire state when spirit < 2', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ spirit: 1 }))
    expect(text).toMatch(/dire/i)
  })

  it('warns about dire state when health is exactly 0', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ health: 0 }))
    expect(text).toMatch(/dire/i)
  })

  it('warns about missing vow when character has no vows', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ vows: [] }))
    expect(text).toMatch(/vow/i)
  })

  it('returns saga continues when character has vows and is healthy', () => {
    const text = deriveReminderText(
      makeCampaign(),
      makeCharacter({
        vows: [{ id: 'v1', title: 'Test', rank: 'dangerous', progress: 3, fulfilled: false }],
        health: 4,
        spirit: 4,
      }),
    )
    expect(text).toMatch(/saga continues/i)
  })

  it('health exactly 2 is not dire (boundary)', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ health: 2, spirit: 5 }))
    expect(text).not.toMatch(/dire/i)
  })

  it('spirit exactly 2 is not dire (boundary)', () => {
    const text = deriveReminderText(makeCampaign(), makeCharacter({ spirit: 2, health: 5 }))
    expect(text).not.toMatch(/dire/i)
  })
})
