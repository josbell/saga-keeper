import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkaldMovesPopover } from './SkaldMovesPopover'

function renderPopover(overrides: Partial<Parameters<typeof SkaldMovesPopover>[0]> = {}) {
  const props = {
    isOpen: true,
    isBusy: false,
    onClose: vi.fn(),
    onMoveSelect: vi.fn(),
    ...overrides,
  }
  return { ...render(<SkaldMovesPopover {...props} />), props }
}

describe('SkaldMovesPopover — visibility', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <SkaldMovesPopover
        isOpen={false}
        isBusy={false}
        onClose={vi.fn()}
        onMoveSelect={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders a dialog when isOpen is true', () => {
    renderPopover()
    expect(screen.getByRole('dialog', { name: /move browser/i })).toBeTruthy()
  })
})

describe('SkaldMovesPopover — structure', () => {
  it('renders all 5 category sections', () => {
    renderPopover()
    expect(screen.getByRole('region', { name: /adventure/i })).toBeTruthy()
    expect(screen.getByRole('region', { name: /combat/i })).toBeTruthy()
    expect(screen.getByRole('region', { name: /quest/i })).toBeTruthy()
    expect(screen.getByRole('region', { name: /relationship/i })).toBeTruthy()
    expect(screen.getByRole('region', { name: /fate/i })).toBeTruthy()
  })

  it('renders move buttons inside the dialog', () => {
    renderPopover()
    const dialog = screen.getByRole('dialog')
    const btns = dialog.querySelectorAll('button:not([aria-label="Close move browser"])')
    expect(btns.length).toBeGreaterThan(0)
  })
})

describe('SkaldMovesPopover — interaction', () => {
  it('calls onMoveSelect and onClose when a move is clicked', () => {
    const { props } = renderPopover()
    const dialog = screen.getByRole('dialog')
    const firstMoveBtn = dialog.querySelector(
      'button:not([aria-label="Close move browser"])',
    ) as HTMLButtonElement
    fireEvent.click(firstMoveBtn)
    expect(props.onMoveSelect).toHaveBeenCalledOnce()
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', () => {
    const { props } = renderPopover()
    fireEvent.click(screen.getByRole('button', { name: /close move browser/i }))
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key', () => {
    const { props } = renderPopover()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('disables move buttons when isBusy is true', () => {
    renderPopover({ isBusy: true })
    const dialog = screen.getByRole('dialog')
    const moveBtns = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>(
        'button:not([aria-label="Close move browser"])',
      ),
    )
    expect(moveBtns.every((b) => b.disabled)).toBe(true)
  })
})
