import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './Textarea'

describe('Textarea — rendering', () => {
  it('renders a textarea element', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeDefined()
  })

  it('forwards placeholder', () => {
    render(<Textarea placeholder="Describe the scene" />)
    expect(screen.getByPlaceholderText('Describe the scene')).toBeDefined()
  })

  it('forwards value in controlled mode', () => {
    render(<Textarea value="A dark moor" onChange={() => {}} />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('A dark moor')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true)
  })

  it('forwards rows prop', () => {
    render(<Textarea rows={5} />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).getAttribute('rows')).toBe('5')
  })
})

describe('Textarea — event handling', () => {
  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'x')
    expect(onChange).toHaveBeenCalled()
  })
})
