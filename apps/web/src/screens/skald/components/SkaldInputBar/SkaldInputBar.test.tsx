import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Move } from '@saga-keeper/domain'
import type { TurnPhase } from '@/store/types'
import { SkaldInputBar } from './SkaldInputBar'

function makeMove(overrides: Partial<Move> = {}): Move {
  return {
    id: 'face-danger',
    name: 'Face Danger',
    trigger: 'Face a threat',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    description: 'When you attempt something risky...',
    ...overrides,
  }
}

const defaultProps = {
  phase: 'idle' as TurnPhase,
  moves: [makeMove()],
  onSend: vi.fn(),
  onMoveSelect: vi.fn(),
  onOracleOpen: vi.fn(),
  isOracleOpen: false,
}

function renderBar(overrides: Partial<typeof defaultProps> = {}) {
  return render(<SkaldInputBar {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SkaldInputBar — structure', () => {
  it('renders input with aria-label "Tell the Skald what you do"', () => {
    renderBar()
    expect(screen.getByRole('textbox', { name: /tell the skald what you do/i })).toBeTruthy()
  })

  it('renders Send button type="button" with aria-label "Send"', () => {
    renderBar()
    const sendBtn = screen.getByRole('button', { name: /^send$/i })
    expect(sendBtn.getAttribute('type')).toBe('button')
  })

  it('renders quick-moves list role="list" aria-label="Quick moves"', () => {
    renderBar()
    expect(screen.getByRole('list', { name: /quick moves/i })).toBeTruthy()
  })

  it('renders listitem per move pill', () => {
    const moves = [makeMove({ id: 'a', trigger: 'Move A' }), makeMove({ id: 'b', trigger: 'Move B' })]
    renderBar({ moves })
    const list = screen.getByRole('list', { name: /quick moves/i })
    expect(list.querySelectorAll('[role="listitem"]').length).toBe(2)
  })
})

describe('SkaldInputBar — quick move pills', () => {
  it('renders pill buttons from moves prop', () => {
    renderBar({ moves: [makeMove({ trigger: 'Face Danger' })] })
    expect(screen.getByRole('button', { name: /face danger/i })).toBeTruthy()
  })

  it('combat move pills have data-category="combat"', () => {
    const moves = [makeMove({ id: 'strike', trigger: 'Strike', category: 'combat' })]
    renderBar({ moves })
    const pill = screen.getByRole('button', { name: /strike/i })
    expect(pill.getAttribute('data-category')).toBe('combat')
  })

  it('non-combat pills do not have data-category="combat"', () => {
    renderBar({ moves: [makeMove({ category: 'adventure' })] })
    const pill = screen.getByRole('button', { name: /face a threat/i })
    expect(pill.getAttribute('data-category')).not.toBe('combat')
  })

  it('clicking a pill calls onMoveSelect with move id', () => {
    const onMoveSelect = vi.fn()
    renderBar({ moves: [makeMove({ id: 'face-danger' })], onMoveSelect })
    fireEvent.click(screen.getByRole('button', { name: /face a threat/i }))
    expect(onMoveSelect).toHaveBeenCalledWith('face-danger')
  })

  it('each pill button has type="button"', () => {
    renderBar({ moves: [makeMove()] })
    const pill = screen.getByRole('button', { name: /face a threat/i })
    expect(pill.getAttribute('type')).toBe('button')
  })
})

describe('SkaldInputBar — input interaction', () => {
  it('typing in the input updates the displayed value', () => {
    renderBar()
    const input = screen.getByRole('textbox', { name: /tell the skald/i }) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'I draw my sword' } })
    expect(input.value).toBe('I draw my sword')
  })

  it('pressing Enter calls onSend with the input text', () => {
    const onSend = vi.fn()
    renderBar({ onSend })
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Forward!' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(onSend).toHaveBeenCalledWith('Forward!')
  })

  it('pressing Enter clears the input after send', () => {
    renderBar()
    const input = screen.getByRole('textbox', { name: /tell the skald/i }) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Some text' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(input.value).toBe('')
  })

  it('pressing Shift+Enter does not call onSend', () => {
    const onSend = vi.fn()
    renderBar({ onSend })
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Some text' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('clicking Send calls onSend with the input text', () => {
    const onSend = vi.fn()
    renderBar({ onSend })
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Hello Skald' } })
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }))
    expect(onSend).toHaveBeenCalledWith('Hello Skald')
  })

  it('Send button is disabled when input is empty', () => {
    renderBar()
    const sendBtn = screen.getByRole('button', { name: /^send$/i }) as HTMLButtonElement
    expect(sendBtn.disabled).toBe(true)
  })

  it('Send button is enabled when input has text', () => {
    renderBar()
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendBtn = screen.getByRole('button', { name: /^send$/i }) as HTMLButtonElement
    expect(sendBtn.disabled).toBe(false)
  })

  it('Send button is disabled when phase is "waiting-for-ai"', () => {
    renderBar({ phase: 'waiting-for-ai' })
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendBtn = screen.getByRole('button', { name: /^send$/i }) as HTMLButtonElement
    expect(sendBtn.disabled).toBe(true)
  })

  it('Send button is disabled when phase is "streaming"', () => {
    renderBar({ phase: 'streaming' })
    const input = screen.getByRole('textbox', { name: /tell the skald/i })
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendBtn = screen.getByRole('button', { name: /^send$/i }) as HTMLButtonElement
    expect(sendBtn.disabled).toBe(true)
  })

  it('input is disabled when phase is "waiting-for-ai"', () => {
    renderBar({ phase: 'waiting-for-ai' })
    const input = screen.getByRole('textbox', { name: /tell the skald/i }) as HTMLInputElement
    expect(input.disabled).toBe(true)
  })
})

describe('SkaldInputBar — oracle button', () => {
  it('renders Oracle button with aria-label "Open oracle"', () => {
    renderBar()
    expect(screen.getByRole('button', { name: /open oracle/i })).toBeTruthy()
  })

  it('clicking Oracle button calls onOracleOpen', () => {
    const onOracleOpen = vi.fn()
    renderBar({ onOracleOpen })
    fireEvent.click(screen.getByRole('button', { name: /open oracle/i }))
    expect(onOracleOpen).toHaveBeenCalledTimes(1)
  })

  it('Oracle button has aria-expanded="false" when popover is closed', () => {
    renderBar({ isOracleOpen: false })
    const oracleBtn = screen.getByRole('button', { name: /open oracle/i })
    expect(oracleBtn.getAttribute('aria-expanded')).toBe('false')
  })

  it('Oracle button has aria-expanded="true" when popover is open', () => {
    renderBar({ isOracleOpen: true })
    const oracleBtn = screen.getByRole('button', { name: /open oracle/i })
    expect(oracleBtn.getAttribute('aria-expanded')).toBe('true')
  })
})
