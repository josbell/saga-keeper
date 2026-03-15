// IronswornPlugin — full RulesetPlugin implementation
// TODO: implement moves, oracle tables, asset catalogue, creation steps
import type { RulesetPlugin } from '@saga-keeper/domain'
import { ironswornManifest } from './manifest'

export const ironswornPlugin: RulesetPlugin = {
  manifest: ironswornManifest,
  character: {
    schema: {}, // TODO: JSON Schema
    defaults: () => ({}), // TODO
    applyCondition: (state, condition, active) => ({ next: state, description: '' }), // TODO
    momentumReset: () => 2, // TODO: factor in debilities
    canAdvance: (state, cost) => false, // TODO
  },
  moves: {
    getAll: () => [], // TODO
    getByCategory: () => [], // TODO
    resolve: (move, roll, state) => ({ // TODO
      result: 'miss', match: false, consequences: [], narrativeHints: [], 
    }),
    suggest: () => [], // TODO
  },
  oracle: {
    getTables: () => [], // TODO: all standard Ironsworn oracle tables
    roll: (tableId) => ({ tableId, roll: 0, raw: '', timestamp: new Date().toISOString() }),
    rollAskFates: (odds) => ({ odds, roll: 0, result: false, extreme: false, timestamp: new Date().toISOString() }),
  },
  assets: {
    getAll: () => [], // TODO
    getByType: () => [], // TODO
  },
  creation: {
    steps: [], // TODO: 6-step Forge wizard
    statBudget: [3, 2, 2, 1, 1],
    validate: () => ({ valid: true, errors: [] }), // TODO
  },
}
