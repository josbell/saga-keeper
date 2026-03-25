import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSkaldTurn } from './useSkaldTurn'
import type { TurnResult } from '@saga-keeper/domain'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/providers/NarrativeDomainProvider', () => ({
  useNarrativeDomain: vi.fn(),
}))

vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}))

import { useNarrativeDomain } from '@/providers/NarrativeDomainProvider'
import { useGameStore } from '@/store'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTurnResult(overrides: Partial<TurnResult> = {}): TurnResult {
  return {
    turnId: 'turn-1',
    input: { type: 'free', userText: 'I rest.' },
    narration: '',
    statDeltas: [],
    extractedEntities: [],
    timestamp: '2026-01-01T00:00:00.000Z',
    sessionEvents: [],
    ...overrides,
  }
}

const mockSetPhase = vi.fn()
const mockSetPendingAction = vi.fn()
const mockAppendMessage = vi.fn()
const mockApplyTurnResult = vi.fn()
const mockProcessTurn = vi.fn()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupStore(phase = 'idle', overrides: Record<string, unknown> = {}) {
  vi.mocked(useGameStore).mockImplementation((selector: (s: any) => unknown) => {
    const state = {
      phase,
      setPhase: mockSetPhase,
      setPendingAction: mockSetPendingAction,
      appendMessage: mockAppendMessage,
      applyTurnResult: mockApplyTurnResult,
      ...overrides,
    }
    return selector(state)
  })
}

function setupDomain(processTurnImpl = mockProcessTurn) {
  vi.mocked(useNarrativeDomain).mockReturnValue({
    processTurn: processTurnImpl,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setupStore()
  setupDomain()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSkaldTurn — isSubmitting', () => {
  it('is false when phase is idle', () => {
    setupStore('idle')
    const { result } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))
    expect(result.current.isSubmitting).toBe(false)
  })

  it('is true when phase is resolving', () => {
    setupStore('resolving')
    const { result } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))
    expect(result.current.isSubmitting).toBe(true)
  })

  it('is true when phase is waiting-for-ai', () => {
    setupStore('waiting-for-ai')
    const { result } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))
    expect(result.current.isSubmitting).toBe(true)
  })

  it('is true when phase is streaming', () => {
    setupStore('streaming')
    const { result } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))
    expect(result.current.isSubmitting).toBe(true)
  })
})

describe('useSkaldTurn — submitAction success', () => {
  it('sets phase to resolving before calling processTurn', async () => {
    const result = makeTurnResult()
    mockProcessTurn.mockResolvedValue(result)
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'I rest.' })
    })

    expect(mockSetPhase).toHaveBeenCalledWith('resolving')
  })

  it('stores pendingAction before calling processTurn', async () => {
    mockProcessTurn.mockResolvedValue(makeTurnResult())
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'I rest.' })
    })

    expect(mockSetPendingAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'free', userText: 'I rest.' }),
    )
  })

  it('calls processTurn with campaignId and action', async () => {
    mockProcessTurn.mockResolvedValue(makeTurnResult())
    const { result: hook } = renderHook(() =>
      useSkaldTurn({ campaignId: 'camp-1', characterId: 'char-1' }),
    )

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'Forward!' })
    })

    expect(mockProcessTurn).toHaveBeenCalledWith(
      'camp-1',
      expect.objectContaining({ type: 'free', userText: 'Forward!', characterId: 'char-1' }),
    )
  })

  it('calls applyTurnResult with the returned TurnResult', async () => {
    const turnResult = makeTurnResult({ narration: 'The fire crackles.' })
    mockProcessTurn.mockResolvedValue(turnResult)
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'I rest.' })
    })

    expect(mockApplyTurnResult).toHaveBeenCalledWith(turnResult)
  })

  it('does not call processTurn when campaignId is empty', async () => {
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: '' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'test' })
    })

    expect(mockProcessTurn).not.toHaveBeenCalled()
  })

  it('does not call processTurn when already submitting', async () => {
    setupStore('resolving')
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'test' })
    })

    expect(mockProcessTurn).not.toHaveBeenCalled()
  })
})

describe('useSkaldTurn — submitAction error', () => {
  it('sets phase to error when processTurn rejects', async () => {
    mockProcessTurn.mockRejectedValue(new Error('Network failure'))
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'I rest.' })
    })

    expect(mockSetPhase).toHaveBeenCalledWith('error')
  })

  it('appends a system message with the error text', async () => {
    mockProcessTurn.mockRejectedValue(new Error('Campaign not found'))
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'I rest.' })
    })

    expect(mockAppendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'system', content: 'Campaign not found' }),
    )
  })

  it('does not call applyTurnResult on error', async () => {
    mockProcessTurn.mockRejectedValue(new Error('fail'))
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'free', userText: 'test' })
    })

    expect(mockApplyTurnResult).not.toHaveBeenCalled()
  })
})

describe('useSkaldTurn — offline tier (no narration)', () => {
  it('calls applyTurnResult even when narration is empty (offline tier)', async () => {
    const offlineResult = makeTurnResult({
      narration: '',
      move: 'face-danger',
      outcome: {
        result: 'strong-hit',
        match: false,
        consequences: [],
        narrativeHints: ['You succeed with grace.'],
      },
    })
    mockProcessTurn.mockResolvedValue(offlineResult)
    const { result: hook } = renderHook(() => useSkaldTurn({ campaignId: 'camp-1' }))

    await act(async () => {
      await hook.current.submitAction({ type: 'move', moveId: 'face-danger', statKey: 'edge' })
    })

    // applyTurnResult is called — outcome card will be shown by the store fan-out
    expect(mockApplyTurnResult).toHaveBeenCalledWith(offlineResult)
  })
})
