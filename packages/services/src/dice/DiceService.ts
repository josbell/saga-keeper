// DiceService — TODO: implement
import type { DiceRoll, DiceRollRequest } from '@saga-keeper/domain'
export interface IDiceService {
  roll(request: DiceRollRequest): DiceRoll
  replay(seed: string, request: DiceRollRequest): DiceRoll
}
