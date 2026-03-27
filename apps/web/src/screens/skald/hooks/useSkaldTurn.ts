import type { PlayerAction } from '@saga-keeper/domain'
import { useNarrativeDomain } from '@/providers/NarrativeDomainProvider'
import { useGameStore } from '@/store'

interface UseSkaldTurnOptions {
  campaignId: string
  characterId?: string
}

interface UseSkaldTurnReturn {
  submitAction: (action: PlayerAction) => Promise<void>
  isSubmitting: boolean
}

/**
 * L1 hook — the only boundary between the React/Zustand world and NarrativeDomain.
 *
 * Responsibilities:
 *  1. Set phase to 'resolving' so the UI blocks input while the turn is in-flight.
 *  2. Store pendingAction so SkaldRightPanel can display the active move.
 *  3. Call narrativeDomain.processTurn() and commit the result via applyTurnResult().
 *  4. On error: set phase to 'error' and append a system message to the feed.
 *
 * This hook MUST NOT import from @saga-keeper/storage or @saga-keeper/ai-gateway directly.
 * Those are wired into NarrativeDomain by NarrativeDomainProvider.
 */
export function useSkaldTurn({ campaignId, characterId }: UseSkaldTurnOptions): UseSkaldTurnReturn {
  const narrativeDomain = useNarrativeDomain()

  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const setPendingAction = useGameStore((s) => s.setPendingAction)
  const appendMessage = useGameStore((s) => s.appendMessage)
  const applyTurnResult = useGameStore((s) => s.applyTurnResult)

  const isSubmitting =
    phase === 'resolving' || phase === 'waiting-for-ai' || phase === 'streaming'

  async function submitAction(action: PlayerAction): Promise<void> {
    if (!campaignId) return
    if (isSubmitting) return

    const fullAction: PlayerAction = {
      ...action,
      ...(characterId !== undefined && { characterId }),
    }

    setPhase('resolving')
    setPendingAction(fullAction)

    try {
      const result = await narrativeDomain.processTurn(campaignId, fullAction)
      applyTurnResult(result)
    } catch (err) {
      setPhase('error')
      appendMessage({
        id: globalThis.crypto.randomUUID(),
        role: 'system',
        content: err instanceof Error ? err.message : 'An unexpected error occurred.',
        timestamp: new Date().toISOString(),
      })
    }
  }

  return { submitAction, isSubmitting }
}
