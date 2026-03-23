import { describe, it, expect } from 'vitest'
import { buildNPCUserPrompt } from './buildNPCUserPrompt'

describe('buildNPCUserPrompt', () => {
  it('includes scene in the output', () => {
    const result = buildNPCUserPrompt({
      scene: 'A foggy river crossing',
      vow: 'Protect the village',
    })
    expect(result).toContain('A foggy river crossing')
  })

  it('includes vow in the output', () => {
    const result = buildNPCUserPrompt({
      scene: 'A foggy river crossing',
      vow: 'Protect the village',
    })
    expect(result).toContain('Protect the village')
  })

  it('includes encounter when provided', () => {
    const result = buildNPCUserPrompt({
      scene: 'A foggy river crossing',
      vow: 'Protect the village',
      encounter: 'A stranger blocks the path',
    })
    expect(result).toContain('A stranger blocks the path')
  })

  it('omits encounter line when not provided', () => {
    const result = buildNPCUserPrompt({
      scene: 'A foggy river crossing',
      vow: 'Protect the village',
    })
    expect(result).not.toContain('Encounter')
  })

  it('includes instruction to return JSON with NPC schema fields', () => {
    const result = buildNPCUserPrompt({
      scene: 'A foggy river crossing',
      vow: 'Protect the village',
    })
    expect(result).toContain('name')
    expect(result).toContain('role')
    expect(result).toContain('demeanour')
    expect(result).toContain('secret')
    expect(result).toContain('bond_potential')
    expect(result).toContain('first_words')
  })
})
