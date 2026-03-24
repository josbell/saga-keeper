import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CharacterHeader } from './CharacterHeader'

const defaultProps = {
  name: 'Aldric',
  experienceEarned: 0,
  experienceSpent: 0,
}

describe('CharacterHeader — rendering', () => {
  it('renders the character name in an h1', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1, name: /Aldric/i })).toBeTruthy()
  })

  it('renders epithet when provided', () => {
    render(<CharacterHeader {...defaultProps} epithet="The Iron-Sworn" />)
    expect(screen.getByText('The Iron-Sworn')).toBeTruthy()
  })

  it('renders "—" as epithet placeholder when epithet is absent', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('renders leading vow title when provided', () => {
    render(<CharacterHeader {...defaultProps} leadingVowTitle="Avenge my kin" />)
    expect(screen.getByText(/Avenge my kin/i)).toBeTruthy()
  })

  it('renders "No active vow" when leadingVowTitle is absent', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.getByText(/no active vow/i)).toBeTruthy()
  })

  it('renders correct number of XP dots (= experienceEarned)', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={5} experienceSpent={2} />)
    const xpButtons = screen.getAllByRole('button')
    expect(xpButtons).toHaveLength(5)
  })

  it('renders spent XP dots with aria-pressed=true', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={5} experienceSpent={3} />)
    const xpButtons = screen.getAllByRole('button')
    expect(xpButtons[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(xpButtons[1]!.getAttribute('aria-pressed')).toBe('true')
    expect(xpButtons[2]!.getAttribute('aria-pressed')).toBe('true')
    expect(xpButtons[3]!.getAttribute('aria-pressed')).toBe('false')
    expect(xpButtons[4]!.getAttribute('aria-pressed')).toBe('false')
  })

  it('renders no XP dots when experienceEarned is 0', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={0} experienceSpent={0} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('renders an img with alt=name when portraitUrl is provided', () => {
    render(<CharacterHeader {...defaultProps} portraitUrl="https://example.com/portrait.jpg" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.alt).toBe('Aldric')
  })

  it('does not render an img element when portraitUrl is absent', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('CharacterHeader — accessibility', () => {
  it('each XP dot has an aria-label with its position', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={3} experienceSpent={0} />)
    const xpButtons = screen.getAllByRole('button')
    expect(xpButtons[0]!.getAttribute('aria-label')).toBe('XP 1')
    expect(xpButtons[1]!.getAttribute('aria-label')).toBe('XP 2')
    expect(xpButtons[2]!.getAttribute('aria-label')).toBe('XP 3')
  })

  it('portrait placeholder has an aria-label when no portraitUrl', () => {
    render(<CharacterHeader {...defaultProps} />)
    const placeholder = document.querySelector('[aria-label="Portrait placeholder"]')
    expect(placeholder).toBeTruthy()
  })

  it('the header element is a <header>', () => {
    const { container } = render(<CharacterHeader {...defaultProps} />)
    expect(container.querySelector('header')).toBeTruthy()
  })
})
