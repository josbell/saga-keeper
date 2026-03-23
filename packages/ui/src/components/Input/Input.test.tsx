import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input — rendering', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeDefined()
  })

  it('forwards placeholder', () => {
    render(<Input placeholder="Enter a name" />)
    expect(screen.getByPlaceholderText('Enter a name')).toBeDefined()
  })

  it('forwards value in controlled mode', () => {
    render(<Input value="Björn" onChange={() => {}} />)
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Björn')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true)
  })
})

describe('Input — event handling', () => {
  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })
})
