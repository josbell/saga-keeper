import { describe, it, expect, beforeEach } from 'vitest'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import Dexie from 'dexie'
import { LocalAdapter } from './LocalAdapter'
import { ArchiveSerializer } from '../archive/ArchiveSerializer'
import type {
  NewCampaign,
  CharacterState,
  SessionEvent,
  WorldEntity,
  CampaignArchive,
} from '@saga-keeper/domain'

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

  it('delete does NOT cascade — characters, events, and world entities persist', async () => {
    const campaign = await adapter.campaigns.create(newCampaign)
    const character: CharacterState = {
      id: 'orphan-char-1',
      campaignId: campaign.id,
      name: 'Orphan',
      rulesetId: 'ironsworn-v1',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await adapter.characters.save(character)
    await adapter.session.append(campaign.id, {
      id: 'orphan-ev-1',
      campaignId: campaign.id,
      turnId: 'turn-1',
      type: 'session.started',
      playerId: 'local',
      payload: {},
      timestamp: new Date().toISOString(),
    })
    const entity: WorldEntity = {
      id: 'orphan-npc-1',
      campaignId: campaign.id,
      type: 'npc',
      name: 'Ghost NPC',
      attributes: {},
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await adapter.world.save(entity)

    await adapter.campaigns.delete(campaign.id)

    // Campaign row is gone
    await expect(adapter.campaigns.get(campaign.id)).rejects.toThrow()
    // Related data still exists (callers must clean up)
    await expect(adapter.characters.get('orphan-char-1')).resolves.toBeDefined()
    const events = await adapter.session.getAll(campaign.id)
    expect(events).toHaveLength(1)
    const entities = await adapter.world.list(campaign.id)
    expect(entities).toHaveLength(1)
  })

  it('update throws on non-existent id', async () => {
    await expect(adapter.campaigns.update('ghost-id', { name: 'Renamed' })).rejects.toThrow(
      'Campaign not found: ghost-id',
    )
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

// ── session ──────────────────────────────────────────────────────────────────

describe('session', () => {
  let adapter: LocalAdapter

  beforeEach(() => {
    adapter = makeAdapter()
  })

  function makeEvent(id: string, campaignId: string, timestamp: string): SessionEvent {
    return {
      id,
      campaignId,
      turnId: 'turn-1',
      type: 'player.input',
      playerId: 'player-1',
      payload: { text: 'I strike!' },
      timestamp,
    }
  }

  it('append stores an event retrievable via getAll', async () => {
    const ev = makeEvent('ev-1', 'camp-1', '2024-01-01T00:00:00.000Z')
    await adapter.session.append('camp-1', ev)
    const all = await adapter.session.getAll('camp-1')
    expect(all).toHaveLength(1)
    expect(all[0]!.id).toBe('ev-1')
  })

  it('getAll returns events sorted ascending by timestamp', async () => {
    await adapter.session.append('camp-1', makeEvent('ev-2', 'camp-1', '2024-01-01T00:00:02.000Z'))
    await adapter.session.append('camp-1', makeEvent('ev-1', 'camp-1', '2024-01-01T00:00:01.000Z'))
    await adapter.session.append('camp-1', makeEvent('ev-3', 'camp-1', '2024-01-01T00:00:03.000Z'))
    const all = await adapter.session.getAll('camp-1')
    expect(all.map((e) => e.id)).toEqual(['ev-1', 'ev-2', 'ev-3'])
  })

  it('getRecent returns latest N events in descending order', async () => {
    for (let i = 1; i <= 5; i++) {
      await adapter.session.append(
        'camp-1',
        makeEvent(`ev-${i}`, 'camp-1', `2024-01-01T00:00:0${i}.000Z`),
      )
    }
    const recent = await adapter.session.getRecent('camp-1', 3)
    expect(recent).toHaveLength(3)
    expect(recent[0]!.id).toBe('ev-5')
    expect(recent[1]!.id).toBe('ev-4')
    expect(recent[2]!.id).toBe('ev-3')
  })

  it('getAll only returns events for the specified campaign', async () => {
    await adapter.session.append('camp-1', makeEvent('ev-a', 'camp-1', '2024-01-01T00:00:01.000Z'))
    await adapter.session.append('camp-2', makeEvent('ev-b', 'camp-2', '2024-01-01T00:00:02.000Z'))
    const all = await adapter.session.getAll('camp-1')
    expect(all).toHaveLength(1)
    expect(all[0]!.id).toBe('ev-a')
  })

  it('append throws when event.campaignId does not match the given campaignId', async () => {
    const ev = makeEvent('ev-mismatch', 'camp-2', '2024-01-01T00:00:01.000Z')
    await expect(adapter.session.append('camp-1', ev)).rejects.toThrow(
      'Event campaignId "camp-2" does not match campaign "camp-1"',
    )
  })
})

// ── world ────────────────────────────────────────────────────────────────────

describe('world', () => {
  let adapter: LocalAdapter

  beforeEach(() => {
    adapter = makeAdapter()
  })

  const entity: WorldEntity = {
    id: 'npc-001',
    campaignId: 'camp-1',
    type: 'npc',
    name: 'Elder Maren',
    attributes: { role: 'guide' },
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('save creates a new entity and returns it', async () => {
    const saved = await adapter.world.save(entity)
    expect(saved.id).toBe('npc-001')
    expect(saved.name).toBe('Elder Maren')
  })

  it('save upserts — overwrites on same id', async () => {
    await adapter.world.save(entity)
    const updated = await adapter.world.save({ ...entity, name: 'Elder Maren the Wise' })
    expect(updated.name).toBe('Elder Maren the Wise')
    const fetched = await adapter.world.get('npc-001')
    expect(fetched.name).toBe('Elder Maren the Wise')
  })

  it('list returns all entities for a campaign', async () => {
    await adapter.world.save(entity)
    await adapter.world.save({ ...entity, id: 'npc-002', name: 'Bard Jorveld' })
    const list = await adapter.world.list('camp-1')
    expect(list).toHaveLength(2)
  })

  it('list returns empty array when no entities for campaign', async () => {
    await adapter.world.save(entity)
    const list = await adapter.world.list('camp-99')
    expect(list).toEqual([])
  })

  it('get returns the entity', async () => {
    await adapter.world.save(entity)
    const fetched = await adapter.world.get('npc-001')
    expect(fetched.id).toBe('npc-001')
  })

  it('get throws on unknown id', async () => {
    await expect(adapter.world.get('ghost')).rejects.toThrow()
  })

  it('delete removes the entity', async () => {
    await adapter.world.save(entity)
    await adapter.world.delete('npc-001')
    const list = await adapter.world.list('camp-1')
    expect(list).toEqual([])
  })
})

// ── export / import ──────────────────────────────────────────────────────────

describe('export and import', () => {
  let adapter: LocalAdapter

  beforeEach(() => {
    adapter = makeAdapter()
  })

  async function seedCampaign() {
    const campaign = await adapter.campaigns.create({
      name: 'Test Campaign',
      rulesetId: 'ironsworn-v1',
      mode: 'solo',
    })
    const character: CharacterState = {
      id: 'char-export-1',
      campaignId: campaign.id,
      name: 'Saga Hero',
      rulesetId: 'ironsworn-v1',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // Link character to campaign
    await adapter.campaigns.update(campaign.id, { characterIds: [character.id] })
    await adapter.characters.save(character)
    await adapter.session.append(campaign.id, {
      id: 'ev-export-1',
      campaignId: campaign.id,
      turnId: 'turn-1',
      type: 'session.started',
      playerId: 'player-1',
      payload: {},
      timestamp: new Date().toISOString(),
    })
    await adapter.world.save({
      id: 'entity-export-1',
      campaignId: campaign.id,
      type: 'npc',
      name: 'Witness',
      attributes: {},
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return campaign.id
  }

  it('export returns a CampaignArchive with all four collections', async () => {
    const campaignId = await seedCampaign()
    const archive = await adapter.export(campaignId)
    expect(archive.campaign.id).toBe(campaignId)
    expect(archive.characters).toHaveLength(1)
    expect(archive.sessionLog).toHaveLength(1)
    expect(archive.world).toHaveLength(1)
    expect(archive.version).toBe('1')
    expect(archive.rulesetId).toBe('ironsworn-v1')
    expect(typeof archive.exportedAt).toBe('string')
  })

  it('import is idempotent — re-importing the same archive does not duplicate records', async () => {
    const campaignId = await seedCampaign()
    const archive = await adapter.export(campaignId)

    const freshAdapter = makeAdapter()
    await freshAdapter.import(archive)
    await freshAdapter.import(archive) // second import must not throw or duplicate

    const campaigns = await freshAdapter.campaigns.list()
    expect(campaigns).toHaveLength(1)

    const events = await freshAdapter.session.getAll(campaignId)
    expect(events).toHaveLength(1)

    const entities = await freshAdapter.world.list(campaignId)
    expect(entities).toHaveLength(1)
  })

  it('import round-trips an archive into a fresh db', async () => {
    const campaignId = await seedCampaign()
    const archive = await adapter.export(campaignId)

    const freshAdapter = makeAdapter()
    const imported = await freshAdapter.import(archive)
    expect(imported.id).toBe(campaignId)

    const campaigns = await freshAdapter.campaigns.list()
    expect(campaigns).toHaveLength(1)

    const chars = await freshAdapter.characters.get('char-export-1')
    expect(chars.name).toBe('Saga Hero')

    const events = await freshAdapter.session.getAll(campaignId)
    expect(events).toHaveLength(1)

    const entities = await freshAdapter.world.list(campaignId)
    expect(entities).toHaveLength(1)
  })
})

// ── ArchiveSerializer ────────────────────────────────────────────────────────

describe('ArchiveSerializer', () => {
  const serializer = new ArchiveSerializer()

  const archive: CampaignArchive = {
    version: '1',
    exportedAt: '2024-01-01T00:00:00.000Z',
    rulesetId: 'ironsworn-v1',
    campaign: {
      id: 'camp-serial-1',
      name: 'Serialized Run',
      rulesetId: 'ironsworn-v1',
      mode: 'solo',
      status: 'active',
      characterIds: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    characters: [],
    world: [],
    sessionLog: [],
  }

  it('serialize produces a JSON string', () => {
    const json = serializer.serialize(archive)
    expect(typeof json).toBe('string')
    expect(json).toContain('Serialized Run')
  })

  it('deserialize reconstructs the original archive', () => {
    const json = serializer.serialize(archive)
    const result = serializer.deserialize(json)
    expect(result.campaign.id).toBe('camp-serial-1')
    expect(result.version).toBe('1')
    expect(result.rulesetId).toBe('ironsworn-v1')
  })

  it('serialize → deserialize round-trips without data loss', () => {
    const json = serializer.serialize(archive)
    const result = serializer.deserialize(json)
    expect(result).toEqual(archive)
  })

  it('deserialize throws a descriptive error on invalid JSON', () => {
    expect(() => serializer.deserialize('not-valid-json{')).toThrow(
      'Invalid archive: could not parse JSON',
    )
  })

  it('deserialize throws on unsupported archive version', () => {
    const wrongVersion = serializer.serialize({ ...archive, version: '99' })
    expect(() => serializer.deserialize(wrongVersion)).toThrow('Unsupported archive version')
  })

  it('deserialize throws when required fields are missing', () => {
    const missing = JSON.stringify({ version: '1', exportedAt: '2024-01-01T00:00:00.000Z' })
    expect(() => serializer.deserialize(missing)).toThrow('Invalid archive: missing required fields')
  })

  it('deserialize throws a descriptive error when JSON is null', () => {
    expect(() => serializer.deserialize('null')).toThrow('Invalid archive: missing required fields')
  })

  it('deserialize throws a descriptive error when JSON is a number', () => {
    expect(() => serializer.deserialize('42')).toThrow('Invalid archive: missing required fields')
  })

  it('deserialize throws a descriptive error when JSON is an array', () => {
    expect(() => serializer.deserialize('[]')).toThrow('Invalid archive: missing required fields')
  })
})
