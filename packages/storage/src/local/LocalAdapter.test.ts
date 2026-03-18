import { describe, it, expect, beforeEach } from 'vitest'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import Dexie from 'dexie'
import { LocalAdapter } from './LocalAdapter'
import type { NewCampaign } from '@saga-keeper/domain'
import type { CharacterState } from '@saga-keeper/domain'

// Inject fake-indexeddb so tests don't require a real browser environment
Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

let dbCounter = 0
function makeAdapter() {
  // Unique db name per test for isolation
  return new LocalAdapter(`saga-keeper-test-${++dbCounter}`)
}

const newCampaign: NewCampaign = {
  name: 'The Iron Road',
  rulesetId: 'ironsworn-v1',
  mode: 'solo',
}

// ── campaigns ───────────────────────────────────────────────────────────────

describe('campaigns', () => {
  let adapter: LocalAdapter

  beforeEach(() => {
    adapter = makeAdapter()
  })

  it('create returns a Campaign with generated id and ISO timestamps', async () => {
    const campaign = await adapter.campaigns.create(newCampaign)
    expect(campaign.id).toBeTypeOf('string')
    expect(campaign.id.length).toBeGreaterThan(0)
    expect(campaign.name).toBe('The Iron Road')
    expect(campaign.rulesetId).toBe('ironsworn-v1')
    expect(campaign.mode).toBe('solo')
    expect(campaign.status).toBe('active')
    expect(campaign.characterIds).toEqual([])
    expect(new Date(campaign.createdAt).getFullYear()).toBeGreaterThanOrEqual(2024)
    expect(campaign.updatedAt).toBe(campaign.createdAt)
  })

  it('list returns CampaignSummary shape (no ownerID, no shareCode)', async () => {
    await adapter.campaigns.create(newCampaign)
    const list = await adapter.campaigns.list()
    expect(list).toHaveLength(1)
    const summary = list[0]!
    expect(summary).toHaveProperty('id')
    expect(summary).toHaveProperty('name')
    expect(summary).toHaveProperty('rulesetId')
    expect(summary).toHaveProperty('status')
    expect(summary).toHaveProperty('mode')
    expect(summary).toHaveProperty('characterIds')
    // Full Campaign has ownerId — summary must NOT include it
    expect(summary).not.toHaveProperty('ownerId')
  })

  it('list returns empty array when no campaigns exist', async () => {
    const list = await adapter.campaigns.list()
    expect(list).toEqual([])
  })

  it('get returns the full campaign', async () => {
    const created = await adapter.campaigns.create(newCampaign)
    const fetched = await adapter.campaigns.get(created.id)
    expect(fetched.id).toBe(created.id)
    expect(fetched.name).toBe('The Iron Road')
  })

  it('get throws on unknown id', async () => {
    await expect(adapter.campaigns.get('nonexistent')).rejects.toThrow()
  })

  it('update merges patch and refreshes updatedAt', async () => {
    const created = await adapter.campaigns.create(newCampaign)
    // Small delay so updatedAt can differ
    await new Promise((r) => setTimeout(r, 2))
    const updated = await adapter.campaigns.update(created.id, { name: 'Renamed', status: 'complete' })
    expect(updated.name).toBe('Renamed')
    expect(updated.status).toBe('complete')
    expect(updated.rulesetId).toBe('ironsworn-v1') // untouched field preserved
    expect(updated.updatedAt > created.updatedAt).toBe(true)
  })

  it('delete removes the record', async () => {
    const created = await adapter.campaigns.create(newCampaign)
    await adapter.campaigns.delete(created.id)
    const list = await adapter.campaigns.list()
    expect(list).toHaveLength(0)
  })
})

// ── characters ──────────────────────────────────────────────────────────────

describe('characters', () => {
  let adapter: LocalAdapter

  beforeEach(() => {
    adapter = makeAdapter()
  })

  const character: CharacterState = {
    id: 'char-001',
    campaignId: 'camp-001',
    name: 'Kira Stoneheart',
    rulesetId: 'ironsworn-v1',
    data: { edge: 2, heart: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('save creates a new character and returns it', async () => {
    const saved = await adapter.characters.save(character)
    expect(saved.id).toBe('char-001')
    expect(saved.name).toBe('Kira Stoneheart')
  })

  it('save upserts — overwrites on same id', async () => {
    await adapter.characters.save(character)
    const updated = await adapter.characters.save({ ...character, name: 'Kira the Bold' })
    expect(updated.name).toBe('Kira the Bold')
    const fetched = await adapter.characters.get('char-001')
    expect(fetched.name).toBe('Kira the Bold')
  })

  it('get returns the saved character', async () => {
    await adapter.characters.save(character)
    const fetched = await adapter.characters.get('char-001')
    expect(fetched.id).toBe('char-001')
  })

  it('get throws on unknown id', async () => {
    await expect(adapter.characters.get('ghost')).rejects.toThrow()
  })
})
