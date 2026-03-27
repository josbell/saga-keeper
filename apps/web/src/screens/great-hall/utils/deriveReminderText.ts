import type { Campaign, CharacterState } from '@saga-keeper/domain'
import type { IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'

/**
 * Derives a Skald's Reminder message from campaign and character state.
 * Returns null when no campaign is active (empty-state handled by the card).
 */
export function deriveReminderText(
  campaign: Campaign | null,
  character: CharacterState | null,
): string | null {
  if (!campaign) return null

  if (!character) {
    return 'Begin a new saga to receive counsel from the Skald.'
  }

  const data = character.data as unknown as IronswornCharacterData

  if (data.health < 2 || data.spirit < 2) {
    return 'Your character is in a dire state. Tend to your wounds before pressing forward.'
  }

  if (!data.vows || data.vows.length === 0) {
    return 'No iron vow binds your path. Consider swearing one before venturing further.'
  }

  return 'Your saga continues. The Skald awaits your next move.'
}
