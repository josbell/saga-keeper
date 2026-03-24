import { renderHook, act, waitFor } from '@testing-library/react'
import { useForgeCounsel } from './useForgeCounsel'
import { useGameStore } from '@/store'
import { INITIAL_DRAFT } from '../types'
import type { AIGateway, CompletionResponse } from '@saga-keeper/domain'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'

const COUNSEL_RESPONSE: CompletionResponse = {
  text: 'The Ironlands await your story.',
  intent: 'forge.counsel',
  tokensUsed: 20,
}

function makeMockGateway(resolveWith = COUNSEL_RESPONSE): AIGateway {
  return {
    complete: vi.fn().mockResolvedValue(resolveWith),
    stream: vi.fn(),
    getCapabilities: vi.fn(),
    getTier: vi.fn().mockReturnValue('full-skald'),
  }
}

const worldSelectStep = ironswornPlugin.creation.steps.find((s) => s.id === 'world-select')!
const statStep = ironswornPlugin.creation.steps.find((s) => s.id === 'stat-assignment')!

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState())
})

describe('useForgeCounsel — fires on steps with aiCounsel', () => {
  it('calls gateway.complete with intent "forge.counsel" when step has aiCounsel', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
    })
    expect(gateway.complete).toHaveBeenCalledWith(
      expect.objectContaining({ intent: 'forge.counsel' })
    )
  })

  it('does not call gateway.complete when step has no aiCounsel', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, statStep, INITIAL_DRAFT))
    })
    expect(gateway.complete).not.toHaveBeenCalled()
  })

  it('re-fires when step changes to a different aiCounsel step', async () => {
    const gateway = makeMockGateway()
    const nameStep = ironswornPlugin.creation.steps.find((s) => s.id === 'name-background')!
    const { rerender } = renderHook(({ step }) => useForgeCounsel(gateway, step, INITIAL_DRAFT), {
      initialProps: { step: worldSelectStep },
    })
    await act(async () => {})
    await act(async () => {
      rerender({ step: nameStep })
    })
    expect(gateway.complete).toHaveBeenCalledTimes(2)
  })

  it('does not re-fire when step id has not changed', async () => {
    const gateway = makeMockGateway()
    const { rerender } = renderHook(({ step }) => useForgeCounsel(gateway, step, INITIAL_DRAFT), {
      initialProps: { step: worldSelectStep },
    })
    await act(async () => {})
    await act(async () => {
      rerender({ step: worldSelectStep })
    })
    expect(gateway.complete).toHaveBeenCalledTimes(1)
  })
})

describe('useForgeCounsel — appends to skaldFeed', () => {
  it('appends a message to useGameStore.messages after gateway resolves', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
    })
    const messages = useGameStore.getState().messages
    expect(messages.length).toBe(1)
  })

  it('appended message has role "skald"', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
    })
    expect(useGameStore.getState().messages[0]?.role).toBe('skald')
  })

  it('appended message content equals gateway response text', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
    })
    expect(useGameStore.getState().messages[0]?.content).toBe(COUNSEL_RESPONSE.text)
  })

  it('does not append a message when step has no aiCounsel', async () => {
    const gateway = makeMockGateway()
    await act(async () => {
      renderHook(() => useForgeCounsel(gateway, statStep, INITIAL_DRAFT))
    })
    expect(useGameStore.getState().messages.length).toBe(0)
  })
})

describe('useForgeCounsel — error handling', () => {
  it('does not throw when gateway.complete rejects', async () => {
    const gateway = makeMockGateway()
    ;(gateway.complete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'))
    await expect(
      act(async () => {
        renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
      })
    ).resolves.not.toThrow()
  })

  it('sets error state on rejection', async () => {
    const gateway = makeMockGateway()
    const err = new Error('network error')
    ;(gateway.complete as ReturnType<typeof vi.fn>).mockRejectedValue(err)
    const { result } = renderHook(() => useForgeCounsel(gateway, worldSelectStep, INITIAL_DRAFT))
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
  })
})
