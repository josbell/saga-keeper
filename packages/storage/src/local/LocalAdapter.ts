import Dexie, { type Table } from 'dexie'
import type {
  StorageAdapter,
  CampaignArchive,
  Campaign,
  CampaignSummary,
  NewCampaign,
  CharacterState,
  SessionEvent,
  WorldEntity,
} from '@saga-keeper/domain'

// ── Dexie database ───────────────────────────────────────────────────────────

class SagaKeeperDb extends Dexie {
  campaigns!: Table<Campaign>
  characters!: Table<CharacterState>
  sessionEvents!: Table<SessionEvent>
  worldEntities!: Table<WorldEntity>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      campaigns: 'id, status',
      characters: 'id, campaignId',
      sessionEvents: 'id, campaignId, [campaignId+timestamp]',
      worldEntities: 'id, campaignId',
    })
  }
}

// ── LocalAdapter ─────────────────────────────────────────────────────────────

export class LocalAdapter implements StorageAdapter {
  readonly type = 'local' as const
  readonly supportsRealtime = false
  readonly requiresAuth = false

  private db: SagaKeeperDb

  constructor(dbName = 'saga-keeper') {
    this.db = new SagaKeeperDb(dbName)
  }

  campaigns = {
    list: async (): Promise<CampaignSummary[]> => {
      const all = await this.db.campaigns.toArray()
      return all.map((c) => {
        const summary: CampaignSummary = {
          id: c.id,
          name: c.name,
          rulesetId: c.rulesetId,
          status: c.status,
          mode: c.mode,
          characterIds: c.characterIds,
        }
        if (c.tagline !== undefined) summary.tagline = c.tagline
        if (c.lastPlayedAt !== undefined) summary.lastPlayedAt = c.lastPlayedAt
        return summary
      })
    },

    get: async (id: string): Promise<Campaign> => {
      const campaign = await this.db.campaigns.get(id)
      if (!campaign) throw new Error(`Campaign not found: ${id}`)
      return campaign
    },

    create: async (data: NewCampaign): Promise<Campaign> => {
      const now = new Date().toISOString()
      const campaign: Campaign = {
        id: crypto.randomUUID(),
        name: data.name,
        rulesetId: data.rulesetId,
        mode: data.mode,
        status: 'active',
        characterIds: [],
        createdAt: now,
        updatedAt: now,
      }
      if (data.tagline !== undefined) campaign.tagline = data.tagline
      await this.db.campaigns.add(campaign)
      return campaign
    },

    update: async (id: string, patch: Partial<Campaign>): Promise<Campaign> => {
      return this.db.transaction('rw', this.db.campaigns, async () => {
        const updatedAt = new Date().toISOString()
        const count = await this.db.campaigns.update(id, { ...patch, updatedAt })
        if (count === 0) throw new Error(`Campaign not found: ${id}`)
        const updated = await this.db.campaigns.get(id)
        if (!updated) throw new Error(`Campaign not found: ${id}`)
        return updated
      })
    },

    delete: async (id: string): Promise<void> => {
      // Deletes only the campaign record. Characters, session events, and world entities
      // for this campaign are NOT cascaded — callers must clean those up if needed.
      await this.db.campaigns.delete(id)
    },
  }

  characters = {
    get: async (id: string): Promise<CharacterState> => {
      const character = await this.db.characters.get(id)
      if (!character) throw new Error(`Character not found: ${id}`)
      return character
    },

    save: async (character: CharacterState): Promise<CharacterState> => {
      await this.db.characters.put(character)
      return character
    },
  }

  session = {
    append: async (campaignId: string, event: SessionEvent): Promise<void> => {
      if (event.campaignId !== campaignId) {
        throw new Error(
          `Event campaignId "${event.campaignId}" does not match campaign "${campaignId}"`,
        )
      }
      await this.db.sessionEvents.add(event)
    },

    appendBatch: async (campaignId: string, events: SessionEvent[]): Promise<void> => {
      // Pre-flight check — runs before the transaction opens, so no writes occur on failure
      const bad = events.find((e) => e.campaignId !== campaignId)
      if (bad) {
        throw new Error(
          `Event campaignId "${bad.campaignId}" does not match campaign "${campaignId}"`,
        )
      }
      await this.db.transaction('rw', this.db.sessionEvents, async () => {
        await this.db.sessionEvents.bulkAdd(events)
      })
    },

    getRecent: async (campaignId: string, limit: number): Promise<SessionEvent[]> => {
      return this.db.sessionEvents
        .where('[campaignId+timestamp]')
        .between([campaignId, Dexie.minKey], [campaignId, Dexie.maxKey])
        .reverse()
        .limit(limit)
        .toArray()
    },

    getAll: async (campaignId: string): Promise<SessionEvent[]> => {
      const events = await this.db.sessionEvents
        .where('[campaignId+timestamp]')
        .between([campaignId, Dexie.minKey], [campaignId, Dexie.maxKey])
        .toArray()
      // Explicit sort — don't rely on implicit compound-index traversal order.
      // Returning 0 for equal timestamps preserves V8's stable insertion order,
      // which matches the appendBatch write order within a single turn.
      return events.sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (a.timestamp > b.timestamp) return 1
        return 0
      })
    },
  }

  world = {
    list: async (campaignId: string): Promise<WorldEntity[]> => {
      return this.db.worldEntities.where('campaignId').equals(campaignId).toArray()
    },

    get: async (id: string): Promise<WorldEntity> => {
      const entity = await this.db.worldEntities.get(id)
      if (!entity) throw new Error(`WorldEntity not found: ${id}`)
      return entity
    },

    save: async (entity: WorldEntity): Promise<WorldEntity> => {
      await this.db.worldEntities.put(entity)
      return entity
    },

    delete: async (id: string): Promise<void> => {
      await this.db.worldEntities.delete(id)
    },
  }

  async export(campaignId: string): Promise<CampaignArchive> {
    return this.db.transaction(
      'r',
      [this.db.campaigns, this.db.characters, this.db.sessionEvents, this.db.worldEntities],
      async () => {
        const campaign = await this.campaigns.get(campaignId)
        const [world, sessionLog] = await Promise.all([
          this.world.list(campaignId),
          this.session.getAll(campaignId),
        ])
        const characters = await Promise.all(
          campaign.characterIds.map((id) => this.characters.get(id)),
        )
        return {
          version: '1',
          exportedAt: new Date().toISOString(),
          rulesetId: campaign.rulesetId,
          campaign,
          characters,
          world,
          sessionLog,
        }
      },
    )
  }

  async import(archive: CampaignArchive): Promise<Campaign> {
    await this.db.transaction(
      'rw',
      [this.db.campaigns, this.db.characters, this.db.worldEntities, this.db.sessionEvents],
      async () => {
        await this.db.campaigns.put(archive.campaign)
        await this.db.characters.bulkPut(archive.characters)
        await this.db.worldEntities.bulkPut(archive.world)
        await this.db.sessionEvents.bulkPut(archive.sessionLog)
      },
    )
    return archive.campaign
  }
}
