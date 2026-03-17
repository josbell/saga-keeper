import type { RulesetManifest } from '@saga-keeper/domain'

export const ironswornManifest: RulesetManifest = {
  id: 'ironsworn-v1',
  displayName: 'Ironsworn',
  version: '1.0.0',
  author: 'Shawn Tomkin',
  playerCount: { min: 1, max: 4 },
  features: ['vows', 'assets', 'oracle-tables', 'world-truths'],
}
