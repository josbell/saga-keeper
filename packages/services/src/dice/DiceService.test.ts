import { describe, it, expect } from 'vitest'
import { DiceService } from './DiceService'
import type { DiceRollRequest } from '@saga-keeper/domain'

const BASE: DiceRollRequest = {
  action: 'd6',
  challenge: ['d10', 'd10'],
  modifier: 0,
}

describe('DiceService.roll', () => {
  it('returns values within die ranges', () => {
    const result = DiceService.roll(BASE)
    expect(result.actionDie).toBeGreaterThanOrEqual(1)
    expect(result.actionDie).toBeLessThanOrEqual(6)
    expect(result.challengeDice[0]).toBeGreaterThanOrEqual(1)
    expect(result.challengeDice[0]).toBeLessThanOrEqual(10)
    expect(result.challengeDice[1]).toBeGreaterThanOrEqual(1)
    expect(result.challengeDice[1]).toBeLessThanOrEqual(10)
  })

  it('total equals actionDie + modifier', () => {
    const result = DiceService.roll({ ...BASE, modifier: 3 })
    expect(result.total).toBe(result.actionDie + 3)
  })

  it('returns a seed', () => {
    const result = DiceService.roll(BASE)
    expect(result.seed).toMatch(/^[0-9a-f]{8}$/)
  })

  it('uses provided seed', () => {
    const result = DiceService.roll({ ...BASE, seed: 'deadbeef' })
    expect(result.seed).toBe('deadbeef')
  })

  it('produces different results on successive rolls (no fixed seed)', () => {
    const results = new Set(Array.from({ length: 20 }, () => DiceService.roll(BASE).seed))
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('DiceService.replay', () => {
  it('produces identical results for the same seed', () => {
    const first = DiceService.roll(BASE)
    const replayed = DiceService.replay(first.seed, BASE)
    expect(replayed.actionDie).toBe(first.actionDie)
    expect(replayed.challengeDice).toEqual(first.challengeDice)
    expect(replayed.total).toBe(first.total)
    expect(replayed.seed).toBe(first.seed)
  })

  it('produces different results for different seeds', () => {
    const a = DiceService.replay('aaaaaaaa', BASE)
    const b = DiceService.replay('bbbbbbbb', BASE)
    expect(a.actionDie !== b.actionDie || a.challengeDice[0] !== b.challengeDice[0]).toBe(true)
  })
})
