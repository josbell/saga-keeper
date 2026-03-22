import type { StateCreator } from 'zustand'
import type { WorldEntity, EntityType } from '@saga-keeper/domain'

export interface WorldSlice {
  entities: WorldEntity[]
  filterType: EntityType | 'all'
  selectedEntityId: string | null
  /** Bulk-replace entities (e.g. on campaign load). Clears selectedEntityId if the
   *  previously selected entity is absent from the new list. */
  setEntities: (entities: WorldEntity[]) => void
  /** Insert or replace a single entity by id. */
  upsertEntity: (entity: WorldEntity) => void
  removeEntity: (id: string) => void
  setFilterType: (type: EntityType | 'all') => void
  /** Set the selected entity by id. Accepts any id — no existence check is performed
   *  because selection may be set before the entity list is loaded from storage. */
  selectEntity: (id: string | null) => void
}

export const createWorldSlice: StateCreator<WorldSlice> = (set) => ({
  entities: [],
  filterType: 'all',
  selectedEntityId: null,

  setEntities: (entities) =>
    set((state) => ({
      entities,
      selectedEntityId:
        state.selectedEntityId !== null && entities.some((e) => e.id === state.selectedEntityId)
          ? state.selectedEntityId
          : null,
    })),

  upsertEntity: (entity) =>
    set((state) => {
      const exists = state.entities.some((e) => e.id === entity.id)
      return {
        entities: exists
          ? state.entities.map((e) => (e.id === entity.id ? entity : e))
          : [...state.entities, entity],
      }
    }),

  removeEntity: (id) =>
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id),
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    })),

  setFilterType: (filterType) => set({ filterType }),

  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
})
