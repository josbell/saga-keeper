import type { SessionEvent, SessionEventType } from '@saga-keeper/domain'
import { formatRelativeDate } from './formatRelativeDate'

export type ActivityDotColor = 'gold' | 'blue' | 'red' | 'dim'

export interface ActivityItem {
  id: string
  title: string
  meta: string
  dotColor: ActivityDotColor
}

const EVENT_COLOR: Record<SessionEventType, ActivityDotColor> = {
  'oracle.consulted': 'gold',
  'vow.updated': 'gold',
  'entity.extracted': 'blue',
  'character.mutated': 'red',
  'move.resolved': 'dim',
  'skald.narrated': 'dim',
  'player.input': 'dim',
  'dice.rolled': 'dim',
  'session.started': 'dim',
  'session.ended': 'dim',
}

const EVENT_TITLE: Record<SessionEventType, string> = {
  'oracle.consulted': 'Oracle consulted',
  'vow.updated': 'Vow progress updated',
  'entity.extracted': 'New entity discovered',
  'character.mutated': 'Character state changed',
  'move.resolved': 'Move resolved',
  'skald.narrated': 'Skald narrated',
  'player.input': 'Player action',
  'dice.rolled': 'Dice rolled',
  'session.started': 'Session started',
  'session.ended': 'Session ended',
}

export function sessionEventsToActivityItems(
  events: SessionEvent[],
  campaignName: string,
): ActivityItem[] {
  return [...events]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6)
    .map((event) => ({
      id: event.id,
      title: EVENT_TITLE[event.type] ?? event.type,
      meta: `${campaignName} · ${formatRelativeDate(event.timestamp) || 'Just now'}`,
      dotColor: EVENT_COLOR[event.type] ?? 'dim',
    }))
}
