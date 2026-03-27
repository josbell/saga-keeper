import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { CampaignSummary } from '@saga-keeper/domain'
import { CampaignCard } from './CampaignCard'

function makeCampaign(overrides: Partial<CampaignSummary> = {}): CampaignSummary {
  return {
    id: 'c1',
    name: 'The Ashwood Oath',
    tagline: 'A blood-debt and a warlord who will not rest.',
    rulesetId: 'ironsworn-v1',
    status: 'active',
    mode: 'solo',
    characterIds: ['ch1'],
    lastPlayedAt: new Date().toISOString(),
    ...overrides,
  }
}

const defaultCharacter = { name: 'Björn Ashclaw', health: 4, spirit: 3, momentum: 2 }
const defaultVow = { title: 'Avenge the slaughter of Clan Thornwood', progress: 3 }

describe('CampaignCard — basic info', () => {
  it('renders campaign name', () => {
    render(<CampaignCard campaign={makeCampaign()} character={defaultCharacter} leadingVow={defaultVow} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('The Ashwood Oath')).toBeTruthy()
  })

  it('renders campaign tagline', () => {
    render(<CampaignCard campaign={makeCampaign()} character={defaultCharacter} leadingVow={defaultVow} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText(/blood-debt/i)).toBeTruthy()
  })

  it('does not render tagline when absent', () => {
    const { tagline: _tag, ...campaignNoTagline } = makeCampaign()
    const { container } = render(<CampaignCard campaign={campaignNoTagline as CampaignSummary} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelector('[data-tagline]')).toBeNull()
  })

  it('renders "Today" for lastPlayedAt set to now', () => {
    render(<CampaignCard campaign={makeCampaign({ lastPlayedAt: new Date().toISOString() })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('Today')).toBeTruthy()
  })
})

describe('CampaignCard — status badge', () => {
  it('renders "Active" badge for active status', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'active' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('renders "Saga Complete" badge for complete status', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'complete' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('Saga Complete')).toBeTruthy()
  })

  it('renders "Abandoned" badge for abandoned status', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'abandoned' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('Abandoned')).toBeTruthy()
  })

  it('appends "· Co-op" for coop-same-pc mode', () => {
    render(<CampaignCard campaign={makeCampaign({ mode: 'coop-same-pc' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText(/Active.*Co-op/i)).toBeTruthy()
  })

  it('appends "· Co-op" for coop-remote mode', () => {
    render(<CampaignCard campaign={makeCampaign({ mode: 'coop-remote' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText(/Active.*Co-op/i)).toBeTruthy()
  })
})

describe('CampaignCard — buttons', () => {
  it('renders "Continue Saga" button for active campaigns', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'active' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue saga/i })).toBeTruthy()
  })

  it('does not render "Continue Saga" for complete campaigns', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'complete' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /continue saga/i })).toBeNull()
  })

  it('does not render "Continue Saga" for abandoned campaigns', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'abandoned' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /continue saga/i })).toBeNull()
  })

  it('clicking "Continue Saga" calls onContinue', () => {
    const onContinue = vi.fn()
    render(<CampaignCard campaign={makeCampaign({ status: 'active' })} character={null} leadingVow={null} onContinue={onContinue} onDetails={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /continue saga/i }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('renders "View Chronicle" button for complete campaigns', () => {
    render(<CampaignCard campaign={makeCampaign({ status: 'complete' })} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByRole('button', { name: /view chronicle/i })).toBeTruthy()
  })

  it('clicking "Details" calls onDetails', () => {
    const onDetails = vi.fn()
    render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={onDetails} />)
    fireEvent.click(screen.getByRole('button', { name: /details/i }))
    expect(onDetails).toHaveBeenCalledOnce()
  })
})

describe('CampaignCard — character', () => {
  it('renders character name', () => {
    render(<CampaignCard campaign={makeCampaign()} character={defaultCharacter} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText('Björn Ashclaw')).toBeTruthy()
  })

  it('renders three meter elements with aria-labels', () => {
    render(<CampaignCard campaign={makeCampaign()} character={defaultCharacter} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByRole('meter', { name: /health/i })).toBeTruthy()
    expect(screen.getByRole('meter', { name: /spirit/i })).toBeTruthy()
    expect(screen.getByRole('meter', { name: /momentum/i })).toBeTruthy()
  })

  it('sets correct aria-valuenow on meters', () => {
    render(<CampaignCard campaign={makeCampaign()} character={defaultCharacter} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    const healthMeter = screen.getByRole('meter', { name: /health/i })
    expect(healthMeter.getAttribute('aria-valuenow')).toBe('4')
  })

  it('does not render character section when character is null', () => {
    const { container } = render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelector('[data-character]')).toBeNull()
  })
})

describe('CampaignCard — vow progress', () => {
  it('renders vow title', () => {
    render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={defaultVow} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(screen.getByText(/Avenge the slaughter/i)).toBeTruthy()
  })

  it('renders exactly 10 progress pips', () => {
    const { container } = render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={defaultVow} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelectorAll('[data-pip]').length).toBe(10)
  })

  it('marks correct number of pips as filled', () => {
    const { container } = render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={{ title: 'Test', progress: 4 }} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelectorAll('[data-pip="filled"]').length).toBe(4)
  })

  it('marks remaining pips as empty', () => {
    const { container } = render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={{ title: 'Test', progress: 4 }} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelectorAll('[data-pip="empty"]').length).toBe(6)
  })

  it('does not render vow section when leadingVow is null', () => {
    const { container } = render(<CampaignCard campaign={makeCampaign()} character={null} leadingVow={null} onContinue={vi.fn()} onDetails={vi.fn()} />)
    expect(container.querySelector('[data-vow]')).toBeNull()
  })
})
