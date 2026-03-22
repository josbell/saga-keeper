import { describe, it, expect } from 'vitest'
import { TokenBudget } from './TokenBudget'

describe('TokenBudget.estimate', () => {
  const budget = new TokenBudget({ maxTokens: 1000 })

  it('returns 0 for empty string', () => {
    expect(budget.estimate('')).toBe(0)
  })

  it('returns 1 for exactly 4 chars (default ratio)', () => {
    expect(budget.estimate('abcd')).toBe(1)
  })

  it('uses ceiling division — 2 chars → 1 token', () => {
    expect(budget.estimate('ab')).toBe(1)
  })

  it('uses ceiling division — 5 chars → 2 tokens', () => {
    expect(budget.estimate('abcde')).toBe(2)
  })

  it('respects custom charsPerToken', () => {
    const b = new TokenBudget({ maxTokens: 100, charsPerToken: 2 })
    expect(b.estimate('abcd')).toBe(2)
  })

  it('handles a large string', () => {
    const text = 'a'.repeat(400)
    expect(budget.estimate(text)).toBe(100)
  })
})

describe('TokenBudget.remaining', () => {
  const budget = new TokenBudget({ maxTokens: 100, charsPerToken: 4 }) // budgetChars = 400

  it('returns full char budget when usedChars is 0', () => {
    expect(budget.remaining(0)).toBe(400)
  })

  it('subtracts used chars from budget', () => {
    expect(budget.remaining(100)).toBe(300)
  })

  it('clamps at 0 — never returns negative', () => {
    expect(budget.remaining(500)).toBe(0)
    expect(budget.remaining(400)).toBe(0)
  })
})

describe('TokenBudget.trimToFit', () => {
  const budget = new TokenBudget({ maxTokens: 1000 })
  const identity = (s: string) => s

  it('returns empty result for empty list', () => {
    const result = budget.trimToFit([], identity, 100)
    expect(result.items).toEqual([])
    expect(result.dropped).toBe(0)
  })

  it('returns all items when they fit within budget', () => {
    const items = ['aa', 'bb', 'cc'] // 2+2+2=6 chars
    const result = budget.trimToFit(items, identity, 100)
    expect(result.items).toEqual(items)
    expect(result.dropped).toBe(0)
  })

  it('drops oldest (index 0) first when over budget', () => {
    const items = ['oldest', 'middle', 'newest']
    // Each word is 6 chars; budget of 13 fits 2 items (12 chars) but not 3 (18 chars)
    const result = budget.trimToFit(items, identity, 13)
    expect(result.items).toEqual(['middle', 'newest'])
    expect(result.dropped).toBe(1)
  })

  it('drops exactly as many as needed', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    // Budget = 3 chars fits items 'c', 'd', 'e' (1+1+1=3)
    const result = budget.trimToFit(items, identity, 3)
    expect(result.items).toEqual(['c', 'd', 'e'])
    expect(result.dropped).toBe(2)
  })

  it('returns empty list when even a single item exceeds budget', () => {
    const items = ['toolong']
    const result = budget.trimToFit(items, identity, 2)
    expect(result.items).toEqual([])
    expect(result.dropped).toBe(1)
  })

  it('works with a custom serialiser', () => {
    const items = [{ text: 'aaa' }, { text: 'bbb' }, { text: 'ccc' }]
    const serialize = (item: { text: string }) => item.text
    // Budget = 7 chars → fits last 2 items (3+3=6 chars)
    const result = budget.trimToFit(items, serialize, 7)
    expect(result.items).toEqual([{ text: 'bbb' }, { text: 'ccc' }])
    expect(result.dropped).toBe(1)
  })

  it('returns all items when budget is exactly equal to total size', () => {
    const items = ['aaa', 'bbb'] // 3+3=6 chars
    const result = budget.trimToFit(items, identity, 6)
    expect(result.items).toEqual(items)
    expect(result.dropped).toBe(0)
  })

  it('returns empty when budget is 0', () => {
    const items = ['a', 'b']
    const result = budget.trimToFit(items, identity, 0)
    expect(result.items).toEqual([])
    expect(result.dropped).toBe(2)
  })
})
