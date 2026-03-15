// ── World entity types ────────────────────────────────────────────────────────

export type EntityType = 'npc' | 'location' | 'threat' | 'faction' | 'creature' | 'item'

export interface WorldEntity {
  id: string
  campaignId: string
  type: EntityType
  name: string
  subtitle?: string
  description?: string
  /** Key attributes — content is ruleset-agnostic key/value */
  attributes: Record<string, string>
  /** IDs of related entities */
  connections: EntityConnection[]
  /** Session event IDs where this entity was first mentioned */
  firstMentionedIn?: string
  createdAt: string
  updatedAt: string
}

export interface EntityConnection {
  entityId: string
  relationship: string
}

export interface WorldSnapshot {
  /** Entities relevant to the current scene, trimmed for token budget */
  entities: WorldEntity[]
  totalEntityCount: number
}

export interface WorldPatch {
  entity: WorldEntity
  vector: Record<string, number>
}
