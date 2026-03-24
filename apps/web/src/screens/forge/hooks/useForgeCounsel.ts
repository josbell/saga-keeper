import { useEffect, useState } from 'react'
import type { AIGateway, GameContext } from '@saga-keeper/domain'
import type { CreationStep } from '@saga-keeper/domain'
import { useGameStore } from '@/store'
import type { ForgeDraft } from '../types'

function buildUserMessage(step: CreationStep, draft: ForgeDraft): string {
  switch (step.id) {
    case 'world-select':
      return `World: ${draft.worldDescription}`
    case 'name-background':
      return `Character: ${draft.name}. Background: ${draft.background}`
    case 'asset-picker':
      return `Selected assets: ${draft.assetIds.join(', ')}`
    case 'vow-composer':
      return `Vow: ${draft.vow?.title ?? ''} (${draft.vow?.rank ?? ''})`
    default:
      return ''
  }
}

export function useForgeCounsel(
  gateway: AIGateway,
  step: CreationStep,
  draft: ForgeDraft
): { error: Error | null } {
  const [error, setError] = useState<Error | null>(null)
  const appendMessage = useGameStore((s) => s.appendMessage)

  useEffect(() => {
    if (!step.aiCounsel) return

    let cancelled = false

    const context: GameContext = {
      rulesetId: 'ironsworn-v1',
      characters: [],
      world: { entities: [], totalEntityCount: 0 },
      recentEvents: [],
      oracleHistory: [],
    }

    gateway
      .complete({ intent: 'forge.counsel', context, userMessage: buildUserMessage(step, draft) })
      .then((res) => {
        if (cancelled || !res.text.trim()) return
        appendMessage({
          id: globalThis.crypto.randomUUID(),
          role: 'skald',
          content: res.text,
          timestamp: new Date().toISOString(),
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id])

  return { error }
}
