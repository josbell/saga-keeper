import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MomentumTrack } from './MomentumTrack'

describe('MomentumTrack — rendering', () => {
  it('renders 17 step buttons (-6 to +10)', () => {
    render(<MomentumTrack value={0} />)
    expect(screen.getAllByRole('button')).toHaveLength(17)
  })

  it('container has role="slider" and aria-label="Momentum"', () => {
    render(<MomentumTrack value={0} />)
    expect(screen.getByRole('slider', { name: /momentum/i })).toBeTruthy()
  })

  it('aria-valuenow equals the value prop', () => {
    render(<MomentumTrack value={3} />)
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('3')
  })

  it('aria-valuemin is "-6"', () => {
    render(<MomentumTrack value={0} />)
    expect(screen.getByRole('slider').getAttribute('aria-valuemin')).toBe('-6')
  })

  it('aria-valuemax is "10"', () => {
    render(<MomentumTrack value={0} />)
    expect(screen.getByRole('slider').getAttribute('aria-valuemax')).toBe('10')
  })

  it('negative-side steps at or below value are data-filled=true', () => {
    render(<MomentumTrack value={-3} />)
    const btn = screen.getByRole('button', { name: '-3' })
    expect(btn.getAttribute('data-filled')).toBe('true')
    const btnAbove = screen.getByRole('button', { name: '-2' })
    expect(btnAbove.getAttribute('data-filled')).toBe('false')
  })

  it('positive-side steps at or below value are data-filled=true', () => {
    render(<MomentumTrack value={4} />)
    const btn = screen.getByRole('button', { name: '4' })
    expect(btn.getAttribute('data-filled')).toBe('true')
    const btnAbove = screen.getByRole('button', { name: '5' })
    expect(btnAbove.getAttribute('data-filled')).toBe('false')
  })

  it('value=10 renders all positive steps filled', () => {
    render(<MomentumTrack value={10} />)
    const btn = screen.getByRole('button', { name: '10' })
    expect(btn.getAttribute('data-filled')).toBe('true')
  })

  it('value=-6 renders all negative steps filled', () => {
    render(<MomentumTrack value={-6} />)
    const btn = screen.getByRole('button', { name: '-6' })
    expect(btn.getAttribute('data-filled')).toBe('true')
  })

  it('zero step gets data-zero="true"', () => {
    render(<MomentumTrack value={0} />)
    const zeroBtn = screen.getByRole('button', { name: '0' })
    expect(zeroBtn.getAttribute('data-zero')).toBe('true')
  })
})

describe('MomentumTrack — interaction', () => {
  it('clicking a step button calls onChange with that step value', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={0} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('clicking a negative step calls onChange with negative value', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={0} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '-3' }))
    expect(onChange).toHaveBeenCalledWith(-3)
  })

  it('readOnly=true: onChange is never called on click', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={0} onChange={onChange} readOnly />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ArrowRight calls onChange with value + 1', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={2} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('ArrowLeft calls onChange with value - 1', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={2} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('ArrowRight at max (10) does not call onChange', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={10} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ArrowLeft at min (-6) does not call onChange', () => {
    const onChange = vi.fn()
    render(<MomentumTrack value={-6} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('MomentumTrack — accessibility', () => {
  it('all step buttons are disabled when readOnly=true', () => {
    render(<MomentumTrack value={0} readOnly />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('step buttons have accessible names matching their integer value', () => {
    render(<MomentumTrack value={0} />)
    expect(screen.getByRole('button', { name: '-6' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '0' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '10' })).toBeTruthy()
  })
})
