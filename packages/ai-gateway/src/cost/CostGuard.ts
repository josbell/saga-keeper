// CostGuard — tracks session spend, warns at 80%, blocks at 100% — TODO: implement
export interface ICostGuard {
  checkBudget(sessionId: string, estimated: number): 'ok' | 'warn' | 'block'
  recordSpend(sessionId: string, tokensUsed: number): void
}
