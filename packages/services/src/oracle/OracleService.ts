// OracleService — TODO: implement
import type { OracleTable, OracleRoll, FatesResult, Odds, MoveOutcome } from '@saga-keeper/domain'
export interface IOracleService {
  roll(tableId: string, tables: OracleTable[]): OracleRoll
  rollAskFates(odds: Odds): FatesResult
  detectTriggers(outcome: MoveOutcome): string[]
}
