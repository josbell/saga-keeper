import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection', () => {
  it('renders as a div or section — NOT role="banner"', () => {
    render(<HeroSection />)
    // There should be no banner role on this element (the outer <header> owns that)
    // We verify by checking the element renders without a banner landmark
    const banners = document.querySelectorAll('[role="banner"]')
    expect(banners.length).toBe(0)
  })

  it('renders an h1 heading "The Great Hall"', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { level: 1, name: /the great hall/i })).toBeTruthy()
  })

  it('renders a greeting text', () => {
    render(<HeroSection />)
    expect(screen.getByText(/welcome/i)).toBeTruthy()
  })

  it('renders a tagline/subtitle', () => {
    render(<HeroSection />)
    expect(screen.getByText(/saga/i)).toBeTruthy()
  })

  it('renders the decorative rune aria-hidden', () => {
    const { container } = render(<HeroSection />)
    const rune = container.querySelector('[aria-hidden="true"]')
    expect(rune).toBeTruthy()
    expect(rune!.textContent).toContain('ᚺ')
  })
})
