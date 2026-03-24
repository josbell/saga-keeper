import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button — rendering', () => {
  it('renders children', () => {
    render(<Button>Strike</Button>)
    expect(screen.getByRole('button', { name: 'Strike' })).toBeDefined()
  })

  it('defaults to type="button"', () => {
    render(<Button>Strike</Button>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit')
  })

  it('exposes data-variant attribute for the given variant', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe('danger')
  })

  it('uses data-variant="primary" by default', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe('primary')
  })

  it('forwards className to the button element', () => {
    render(<Button className="extra">Go</Button>)
    expect(screen.getByRole('button').classList.contains('extra')).toBe(true)
  })
})

describe('Button — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Strike</Button>)
    const btn = screen.getByRole('button')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Strike
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('Button — event handling', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Strike</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
