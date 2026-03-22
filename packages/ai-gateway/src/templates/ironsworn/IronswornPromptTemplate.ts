// IronswornPromptTemplate — versioned system prompt for rulesetId 'ironsworn-v1'
// Adapts prompts from ironsworn-ai-experiment/src/lib/ai/prompts.ts

import type { AIIntent, GameContext, CharacterSnapshot, WorldSnapshot, SessionEvent, OracleRoll } from '@saga-keeper/domain'
import type { IPromptTemplate } from '../PromptTemplate'

const SUPPORTED_RULESET = 'ironsworn-v1'

export class IronswornPromptTemplate implements IPromptTemplate {
  render(rulesetId: string, intent: AIIntent, context: GameContext): string {
    if (rulesetId !== SUPPORTED_RULESET) {
      throw new Error(`IronswornPromptTemplate does not support rulesetId "${rulesetId}"`)
    }
    const preamble = this.intentPreamble(intent)
    const sections = this.buildSections(context)
    return `${preamble}\n\n${sections}`.trimEnd()
  }

  private intentPreamble(intent: AIIntent): string {
    switch (intent) {
      case 'oracle.narrate':
        return `You are an oracle interpreter for the Ironsworn tabletop RPG. The player has rolled on an oracle table and received a result. Your job is to help them weave that result into their current scene and vow in 2–3 sentences. Match Ironsworn's tone: grounded, terse, evocative. Never assign mechanical outcomes. Never resolve the scene for them.`

      case 'oracle.extract':
        return `You are an oracle interpreter for the Ironsworn tabletop RPG tasked with structured extraction. Given an oracle result and scene context, respond with valid JSON only — no prose outside the JSON object. Extract: the narrative implication, the affected vow (if any), and any world entities introduced.`

      case 'skald.narrate':
        return `You are a narrator (Skald) for the Ironsworn tabletop RPG. The player describes their action and the dice outcome has been resolved. Write 2–4 sentences of narrative prose in the second person ("You…") that brings the outcome to life. Match Ironsworn's tone: grounded, terse, evocative. Do not resolve what the player has not yet decided.`

      case 'skald.move':
        return `You are a move resolver for the Ironsworn tabletop RPG. A move has been triggered, dice rolled, and an outcome determined. Narrate the move outcome in 2–3 sentences in the second person ("You…"). Be precise about what the outcome means mechanically. Match Ironsworn's tone: grounded, terse, evocative.`

      case 'world.generate':
        return `You are a character generator for the Ironsworn tabletop RPG. Generate NPCs that feel at home in the Ironlands: weathered, purposeful, carrying secrets. Always respond with valid JSON matching the provided schema exactly. No prose outside the JSON object.`

      case 'world.expand':
        return `You are an event generator for the Ironsworn tabletop RPG. Generate complications and opportunities that feel earned by the fiction. Respond with valid JSON only.`

      case 'hall.reminder':
        return `You are a session scribe for the Ironsworn tabletop RPG. The player will give you their raw session notes. Write a concise narrative recap in the second person ("You ventured…") matching Ironsworn's voice. 150–250 words. Preserve mechanical details (progress made, vows sworn/fulfilled, bonds formed). Do not editorialize or add fiction the player did not mention.`

      case 'forge.counsel':
        return `You are a Forge counsellor for the Ironsworn tabletop RPG. The player is seeking guidance on how to proceed with their story, vows, or world. Offer 2–3 concise suggestions that respect the player's autonomy and Ironsworn's solo-play principles. Be direct. Never make choices for the player.`

      default: {
        const _exhaustive: never = intent
        throw new Error(`IronswornPromptTemplate: unhandled intent "${_exhaustive}"`)
      }
    }
  }

  private buildSections(context: GameContext): string {
    const parts: string[] = []

    const charBlock = this.renderCharacters(context.characters)
    if (charBlock) parts.push(charBlock)

    const worldBlock = this.renderWorld(context.world)
    if (worldBlock) parts.push(worldBlock)

    const eventsBlock = this.renderRecentEvents(context.recentEvents)
    if (eventsBlock) parts.push(eventsBlock)

    const oracleBlock = this.renderOracleHistory(context.oracleHistory)
    if (oracleBlock) parts.push(oracleBlock)

    if (context.narrativeTone) {
      parts.push(`## Tone\n${toneDescription(context.narrativeTone)}`)
    }

    return parts.join('\n\n')
  }

  private renderCharacters(characters: CharacterSnapshot[]): string {
    if (characters.length === 0) return ''
    const lines = characters.map((c) => `- **${c.name}** (${c.rulesetId}) — ${c.summary}`)
    return `## Characters\n${lines.join('\n')}`
  }

  private renderWorld(world: WorldSnapshot): string {
    if (world.entities.length === 0 && world.totalEntityCount === 0) return ''
    const lines = world.entities.map((e) => {
      const desc = e.description ? ` — ${e.description}` : ''
      return `- [${e.type}] **${e.name}**${desc}`
    })
    const hidden = world.totalEntityCount - world.entities.length
    const header = hidden > 0
      ? `## World (${world.entities.length} of ${world.totalEntityCount} entities shown)`
      : `## World`
    return `${header}\n${lines.join('\n')}`
  }

  private renderRecentEvents(events: SessionEvent[]): string {
    if (events.length === 0) return ''
    const lines = events.map((e) => `- ${e.type}: ${JSON.stringify(e.payload)}`)
    return `## Recent Events\n${lines.join('\n')}`
  }

  private renderOracleHistory(rolls: OracleRoll[]): string {
    if (rolls.length === 0) return ''
    const lines = rolls.map((r) => `- ${r.tableId} (roll ${r.roll}): ${r.raw}`)
    return `## Oracle History\n${lines.join('\n')}`
  }
}

function toneDescription(tone: NonNullable<GameContext['narrativeTone']>): string {
  switch (tone) {
    case 'grim': return 'The tone is grim and dark. Outcomes are harsh; hope is scarce.'
    case 'heroic': return 'The tone is heroic and epic. Deeds matter; glory is within reach.'
    case 'mythic': return 'The tone is mythic. The world is ancient, strange, and vast.'
  }
}
