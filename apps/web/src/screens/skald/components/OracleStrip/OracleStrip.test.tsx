import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OracleStrip, formatTableName } from './OracleStrip'

describe('formatTableName', () => {
  it('capitalises a single-word table', () => {
    expect(formatTableName('theme')).toBe('Theme')
  })

  it('capitalises each word in a kebab-case table', () => {
    expect(formatTableName('settlement-name')).toBe('Settlement Name')
  })

  it('joins compound tables with " + "', () => {
    expect(formatTableName('action+theme')).toBe('Action + Theme')
  })

  it('handles compound tables with multi-word parts', () => {
    expect(formatTableName('pay-the-price+iron-vow')).toBe('Pay The Price + Iron Vow')
  })
})

describe('OracleStrip — structure', () => {
  it('renders the raw oracle result', () => {
    render(<OracleStrip tableId="theme" roll={42} raw="Darkness" />)
    expect(screen.getByText('Darkness')).toBeTruthy()
  })

  it('renders the roll number', () => {
    render(<OracleStrip tableId="theme" roll={42} raw="Darkness" />)
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('renders the formatted table name', () => {
    render(<OracleStrip tableId="settlement-name" roll={7} raw="Ironhaven" />)
    expect(screen.getByText('Settlement Name')).toBeTruthy()
  })

  it('aria-label includes formatted name and raw result', () => {
    render(<OracleStrip tableId="action+theme" roll={55} raw="Seek Danger" />)
    const strip = screen.getByTestId('oracle-strip')
    expect(strip.getAttribute('aria-label')).toBe('Oracle: Action + Theme — Seek Danger')
  })
})
