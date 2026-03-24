import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CharacterHeader } from './CharacterHeader'

const defaultProps = {
  name: 'Aldric',
  experienceEarned: 0,
  experienceSpent: 0,
}

describe('CharacterHeader — rendering', () => {
  it('renders the character name in a heading', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /Aldric/i })).toBeTruthy()
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

  it('renders an accessible XP summary label', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={5} experienceSpent={2} />)
    expect(screen.getByLabelText(/experience: 2 of 5 xp spent/i)).toBeTruthy()
  })

  it('renders correct number of XP dot spans (= experienceEarned)', () => {
    const { container } = render(
      <CharacterHeader {...defaultProps} experienceEarned={5} experienceSpent={2} />
    )
    const dots = container.querySelectorAll('[aria-hidden="true"]')
    expect(dots).toHaveLength(5)
  })

  it('renders spent XP dots with data-filled=true', () => {
    const { container } = render(
      <CharacterHeader {...defaultProps} experienceEarned={5} experienceSpent={3} />
    )
    const dots = Array.from(container.querySelectorAll('[aria-hidden="true"]'))
    expect(dots[0]!.getAttribute('data-filled')).toBe('true')
    expect(dots[1]!.getAttribute('data-filled')).toBe('true')
    expect(dots[2]!.getAttribute('data-filled')).toBe('true')
    expect(dots[3]!.getAttribute('data-filled')).toBe('false')
    expect(dots[4]!.getAttribute('data-filled')).toBe('false')
  })

  it('renders no XP dots when experienceEarned is 0', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={0} experienceSpent={0} />)
    expect(screen.queryByLabelText(/xp/i)).toBeNull()
  })

  it('renders an img with alt=name when portraitUrl is provided', () => {
    render(<CharacterHeader {...defaultProps} portraitUrl="https://example.com/portrait.jpg" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.alt).toBe('Aldric')
  })

  it('does not render an <img> element when portraitUrl is absent', () => {
    const { container } = render(<CharacterHeader {...defaultProps} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('CharacterHeader — accessibility', () => {
  it('XP container has an accessible label summarising earned and spent', () => {
    render(<CharacterHeader {...defaultProps} experienceEarned={3} experienceSpent={1} />)
    expect(screen.getByLabelText(/experience: 1 of 3 xp spent/i)).toBeTruthy()
  })

  it('portrait placeholder has role="img" and aria-label when no portraitUrl', () => {
    render(<CharacterHeader {...defaultProps} />)
    expect(screen.getByRole('img', { name: /portrait placeholder/i })).toBeTruthy()
  })

  it('the header element is a <header>', () => {
    const { container } = render(<CharacterHeader {...defaultProps} />)
    expect(container.querySelector('header')).toBeTruthy()
  })
})
