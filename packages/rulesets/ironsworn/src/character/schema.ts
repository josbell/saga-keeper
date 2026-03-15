export interface IronswornDebilities {
  wounded: boolean; shaken: boolean; unprepared: boolean; encumbered: boolean
  maimed: boolean; corrupted: boolean; cursed: boolean; tormented: boolean; weak: boolean
}

export interface IronswornVow {
  id: string
  title: string
  rank: 'troublesome' | 'dangerous' | 'formidable' | 'extreme' | 'epic'
  progress: number  // 0–10
  fulfilled: boolean
}

export interface IronswornCharacterData {
  edge: number; heart: number; iron: number; shadow: number; wits: number
  health: number; spirit: number; supply: number; momentum: number
  debilities: IronswornDebilities
  vows: IronswornVow[]
  bonds: string[]
  assetIds: string[]
  experience: { earned: number; spent: number }
}

export const IRONSWORN_STAT_BUDGET = [3, 2, 2, 1, 1] as const

export const IRONSWORN_DEFAULTS: IronswornCharacterData = {
  edge: 1, heart: 1, iron: 1, shadow: 1, wits: 1,
  health: 5, spirit: 5, supply: 5, momentum: 2,
  debilities: {
    wounded: false, shaken: false, unprepared: false, encumbered: false,
    maimed: false, corrupted: false, cursed: false, tormented: false, weak: false,
  },
  vows: [], bonds: [], assetIds: [],
  experience: { earned: 0, spent: 0 },
}
