import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { NarrativeDomain, OracleService, DiceService, type INarrativeDomain } from '@saga-keeper/services'
import { LocalAdapter } from '@saga-keeper/storage'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { OfflineAIGateway } from './OfflineAIGateway'

// ── Context ───────────────────────────────────────────────────────────────────

interface NarrativeDomainContextValue {
  narrativeDomain: INarrativeDomain
}

const NarrativeDomainContext = createContext<NarrativeDomainContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

interface NarrativeDomainProviderProps {
  children: ReactNode
}

/**
 * Constructs the NarrativeDomain dependency graph once (via useMemo) and
 * exposes it to the component tree via context.
 *
 * Architecture notes:
 * - DiceService is a singleton object — NOT a class; do not call `new DiceService()`
 * - OracleService takes `rand?: () => number` — constructed with no args (uses Math.random)
 * - OfflineAIGateway.getTier() returns 'offline'; NarrativeDomain skips AI calls entirely
 */
export function NarrativeDomainProvider({ children }: NarrativeDomainProviderProps) {
  const narrativeDomain = useMemo(() => {
    const storage = new LocalAdapter()
    const oracle = new OracleService()
    const ai = new OfflineAIGateway()
    // DiceService is a plain object (not a class) — pass the singleton directly
    return new NarrativeDomain(storage, ironswornPlugin, ai, oracle, DiceService)
  }, [])

  return (
    <NarrativeDomainContext.Provider value={{ narrativeDomain }}>
      {children}
    </NarrativeDomainContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns the INarrativeDomain instance from context.
 * Must be called inside a NarrativeDomainProvider.
 */
export function useNarrativeDomain(): INarrativeDomain {
  const ctx = useContext(NarrativeDomainContext)
  if (!ctx) {
    throw new Error('useNarrativeDomain must be called inside a <NarrativeDomainProvider>')
  }
  return ctx.narrativeDomain
}
