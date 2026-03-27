import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NarrativeDomainProvider, useNarrativeDomain, usePersistSetup } from './NarrativeDomainProvider'

// ── Helper component that calls the hook ──────────────────────────────────────

function Inspector() {
  const domain = useNarrativeDomain()
  return <div data-testid="result">{typeof domain.processTurn}</div>
}

function ThrowerOutsideProvider() {
  try {
    useNarrativeDomain()
    return <div>no error</div>
  } catch (e) {
    return <div data-testid="error">{(e as Error).message}</div>
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NarrativeDomainProvider', () => {
  it('provides a domain with processTurn function', () => {
    render(
      <NarrativeDomainProvider>
        <Inspector />
      </NarrativeDomainProvider>,
    )
    expect(screen.getByTestId('result').textContent).toBe('function')
  })

  it('throws when useNarrativeDomain is called outside provider', () => {
    render(<ThrowerOutsideProvider />)
    expect(screen.getByTestId('error').textContent).toMatch(
      /useNarrativeDomain must be called inside/i,
    )
  })

  it('throws when usePersistSetup is called outside provider', () => {
    function PersistSetupOutside() {
      try {
        usePersistSetup()
        return <div>no error</div>
      } catch (e) {
        return <div data-testid="persist-error">{(e as Error).message}</div>
      }
    }
    render(<PersistSetupOutside />)
    expect(screen.getByTestId('persist-error').textContent).toMatch(
      /usePersistSetup must be called inside/i,
    )
  })
})

describe('OfflineAIGateway', () => {
  it('getTier returns offline', async () => {
    const { OfflineAIGateway } = await import('./OfflineAIGateway')
    const gw = new OfflineAIGateway()
    expect(gw.getTier()).toBe('offline')
  })

  it('getCapabilities returns localOnly: true', async () => {
    const { OfflineAIGateway } = await import('./OfflineAIGateway')
    const gw = new OfflineAIGateway()
    expect(gw.getCapabilities().localOnly).toBe(true)
  })

  it('complete() throws', async () => {
    const { OfflineAIGateway } = await import('./OfflineAIGateway')
    const gw = new OfflineAIGateway()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => gw.complete({} as any)).toThrow('must never be called')
  })
})
