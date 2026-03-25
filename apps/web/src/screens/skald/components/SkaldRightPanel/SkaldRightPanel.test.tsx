import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import type { CharacterState } from '@saga-keeper/domain'
import type { TurnPhase } from '@/store/types'
import type { PlayerAction } from '@saga-keeper/domain'
import { SkaldRightPanel } from './SkaldRightPanel'

function makeCharacter(overrides: Partial<IronswornCharacterData> = {}): CharacterState {
  const data = { ...ironswornPlugin.character.defaults(), ...overrides }
  return {
    id: 'char-1',
    campaignId: 'camp-1',
    name: 'Björn Ashclaw',
    rulesetId: 'ironsworn-v1',
    data: data as Record<string, unknown>,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function renderPanel(
  character: CharacterState | null = null,
  pendingAction: PlayerAction | null = null,
  phase: TurnPhase = 'idle',
) {
  return render(<SkaldRightPanel character={character} pendingAction={pendingAction} phase={phase} />)
}

describe('SkaldRightPanel — Active Scene', () => {
  it('renders "Active Scene" heading', () => {
    renderPanel()
    expect(screen.getByText(/active scene/i)).toBeTruthy()
  })

  it('renders placeholder when no scene context', () => {
    renderPanel()
    expect(screen.getByText(/awaiting scene/i)).toBeTruthy()
  })
})

describe('SkaldRightPanel — Move Reference', () => {
  it('renders "Move Reference" heading', () => {
    renderPanel()
    expect(screen.getByText(/move reference/i)).toBeTruthy()
  })

  it('renders move name when pendingAction has a moveId', () => {
    const action: PlayerAction = { type: 'move', moveId: 'compel', statKey: 'heart' }
    renderPanel(null, action)
    expect(screen.getByText(/compel/i)).toBeTruthy()
  })

  it('renders Strong Hit label when move reference is shown', () => {
    const action: PlayerAction = { type: 'move', moveId: 'compel', statKey: 'heart' }
    renderPanel(null, action)
    expect(screen.getByText(/strong hit/i)).toBeTruthy()
  })

  it('renders Weak Hit label when move reference is shown', () => {
    const action: PlayerAction = { type: 'move', moveId: 'compel', statKey: 'heart' }
    renderPanel(null, action)
    expect(screen.getByText(/weak hit/i)).toBeTruthy()
  })

  it('renders Miss label when move reference is shown', () => {
    const action: PlayerAction = { type: 'move', moveId: 'compel', statKey: 'heart' }
    renderPanel(null, action)
    expect(screen.getByText(/miss/i)).toBeTruthy()
  })

  it('renders empty state when no pending action', () => {
    renderPanel()
    expect(screen.getByText(/no active move/i)).toBeTruthy()
  })
})

describe('SkaldRightPanel — Vow Tracker', () => {
  it('renders "Tracked Vows" heading', () => {
    renderPanel()
    expect(screen.getByText(/tracked vows/i)).toBeTruthy()
  })

  it('renders "No vows" placeholder when character has no vows', () => {
    renderPanel(makeCharacter({ vows: [] }))
    expect(screen.getByText(/no vows sworn/i)).toBeTruthy()
  })

  it('renders vow title', () => {
    const char = makeCharacter({
      vows: [{ id: 'v1', title: 'Find the runestone', rank: 'dangerous', progress: 4, fulfilled: false }],
    })
    renderPanel(char)
    expect(screen.getByText('Find the runestone')).toBeTruthy()
  })

  it('renders vow rank label', () => {
    const char = makeCharacter({
      vows: [{ id: 'v1', title: 'Find the runestone', rank: 'dangerous', progress: 4, fulfilled: false }],
    })
    renderPanel(char)
    expect(screen.getByText(/dangerous/i)).toBeTruthy()
  })

  it('vow progress uses role="progressbar" with aria-valuenow', () => {
    const char = makeCharacter({
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'troublesome', progress: 3, fulfilled: false }],
    })
    renderPanel(char)
    const bar = screen.getByRole('progressbar', { name: /test vow progress/i })
    expect(bar.getAttribute('aria-valuenow')).toBe('3')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('10')
  })

  it('progress boxes are presentational (aria-hidden)', () => {
    const char = makeCharacter({
      vows: [{ id: 'v1', title: 'Test Vow', rank: 'troublesome', progress: 4, fulfilled: false }],
    })
    renderPanel(char)
    const bar = screen.getByRole('progressbar', { name: /test vow progress/i })
    const boxes = bar.querySelectorAll('[aria-hidden="true"]')
    expect(boxes.length).toBe(10)
  })
})

describe('SkaldRightPanel — Warning', () => {
  it('does not render warning block when phase is not "error"', () => {
    renderPanel(null, null, 'idle')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders warning block when phase is "error"', () => {
    renderPanel(null, null, 'error')
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
