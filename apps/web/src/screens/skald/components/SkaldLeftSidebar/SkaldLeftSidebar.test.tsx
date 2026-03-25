import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import type { CharacterState } from '@saga-keeper/domain'
import { SkaldLeftSidebar } from './SkaldLeftSidebar'

function makeCharacter(overrides: Partial<IronswornCharacterData> = {}): CharacterState {
  const data = { ...ironswornPlugin.character.defaults(), ...overrides }
  return {
    id: 'char-1',
    campaignId: 'camp-1',
    name: 'Björn Ashclaw',
    epithet: 'Warden · Dangerous',
    rulesetId: 'ironsworn-v1',
    data: data as Record<string, unknown>,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('SkaldLeftSidebar — no character', () => {
  it('renders placeholder when character is null', () => {
    render(<SkaldLeftSidebar character={null} />)
    expect(screen.getByText(/no character/i)).toBeTruthy()
  })

  it('does not render stat bars when character is null', () => {
    render(<SkaldLeftSidebar character={null} />)
    expect(screen.queryByRole('meter', { name: /health/i })).toBeNull()
  })
})

describe('SkaldLeftSidebar — character card', () => {
  it('renders character name', () => {
    render(<SkaldLeftSidebar character={makeCharacter()} />)
    expect(screen.getByText('Björn Ashclaw')).toBeTruthy()
  })

  it('renders epithet below name', () => {
    render(<SkaldLeftSidebar character={makeCharacter()} />)
    expect(screen.getByText('Warden · Dangerous')).toBeTruthy()
  })

  it('renders health bar with aria-label "Health"', () => {
    render(<SkaldLeftSidebar character={makeCharacter({ health: 4 })} />)
    expect(screen.getByRole('meter', { name: /health/i })).toBeTruthy()
  })

  it('renders spirit bar with aria-label "Spirit"', () => {
    render(<SkaldLeftSidebar character={makeCharacter({ spirit: 3 })} />)
    expect(screen.getByRole('meter', { name: /spirit/i })).toBeTruthy()
  })

  it('renders momentum bar with aria-label "Momentum"', () => {
    render(<SkaldLeftSidebar character={makeCharacter({ momentum: 2 })} />)
    expect(screen.getByRole('meter', { name: /momentum/i })).toBeTruthy()
  })

  it('health bar aria-valuenow reflects current health', () => {
    render(<SkaldLeftSidebar character={makeCharacter({ health: 3 })} />)
    const meter = screen.getByRole('meter', { name: /health/i })
    expect(meter.getAttribute('aria-valuenow')).toBe('3')
  })

  it('renders numeric health label', () => {
    render(<SkaldLeftSidebar character={makeCharacter({ health: 4 })} />)
    // Health value label is shown next to the bar
    const healthSection = screen.getByRole('meter', { name: /health/i }).closest('[data-testid="stat-bar-health"]')
    expect(healthSection?.textContent).toContain('4')
  })
})

describe('SkaldLeftSidebar — session list', () => {
  it('renders "Current Session" heading', () => {
    render(<SkaldLeftSidebar character={null} />)
    expect(screen.getByText(/current session/i)).toBeTruthy()
  })

  it('current session item has aria-current="true"', () => {
    render(<SkaldLeftSidebar character={null} />)
    const currentItem = screen.getByText(/current session/i).closest('li')
    expect(currentItem?.getAttribute('aria-current')).toBe('true')
  })
})
