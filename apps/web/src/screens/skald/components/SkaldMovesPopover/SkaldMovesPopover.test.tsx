import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkaldMovesPopover } from './SkaldMovesPopover'

let rootEl: HTMLDivElement

beforeEach(() => {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
})

afterEach(() => {
  document.body.removeChild(rootEl)
})

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

  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const onClose = vi.fn()
    const { rerender } = render(
      <SkaldMovesPopover isOpen isBusy={false} onClose={onClose} onMoveSelect={vi.fn()} />,
    )
    rerender(
      <SkaldMovesPopover isOpen={false} isBusy={false} onClose={onClose} onMoveSelect={vi.fn()} />,
    )

    expect(document.activeElement).toBe(trigger)
    document.body.removeChild(trigger)
  })
})

describe('SkaldMovesPopover — inert background', () => {
  it('sets inert on #root when open', () => {
    renderPopover({ isOpen: true })
    expect(document.getElementById('root')?.hasAttribute('inert')).toBe(true)
  })

  it('removes inert from #root when closed', () => {
    const { rerender } = render(
      <SkaldMovesPopover isOpen isBusy={false} onClose={vi.fn()} onMoveSelect={vi.fn()} />,
    )
    rerender(
      <SkaldMovesPopover isOpen={false} isBusy={false} onClose={vi.fn()} onMoveSelect={vi.fn()} />,
    )
    expect(document.getElementById('root')?.hasAttribute('inert')).toBe(false)
  })
})
