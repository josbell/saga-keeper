import type { StateCreator } from 'zustand'
import type { CharacterState } from '@saga-keeper/domain'

export interface CharacterSlice {
  character: CharacterState | null
  isDirty: boolean
  setCharacter: (character: CharacterState) => void
  /** Merges patch into character.data only — top-level fields (id, name, etc.) are not overwritten. */
  patchCharacterData: (patch: Record<string, unknown>) => void
  clearCharacter: () => void
  /** Call after the character has been persisted to storage — clears the dirty flag. */
  markClean: () => void
}

export const createCharacterSlice: StateCreator<CharacterSlice> = (set) => ({
  character: null,
  isDirty: false,

  setCharacter: (character) => set({ character, isDirty: false }),

  patchCharacterData: (patch) =>
    set((state) => {
      if (state.character === null) return state
      return {
        character: {
          ...state.character,
          data: { ...state.character.data, ...patch },
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }
    }),

  clearCharacter: () => set({ character: null, isDirty: false }),

  markClean: () => set({ isDirty: false }),
})
