// NarrativeDomain — orchestrates a full Skald turn (spec §8)
import type {
  PlayerAction,
  NarrativeTurn,
  StorageAdapter,
  RulesetPlugin,
  AIGateway,
  AIIntent,
  GameContext,
  CharacterState,
  CharacterSnapshot,
  SessionEvent,
  SessionEventType,
  DiceRoll,
  Odds,
} from '@saga-keeper/domain'
import { ODDS_THRESHOLD, type IOracleService } from '../oracle/OracleService'
import type { IDiceService } from '../dice/DiceService'

export interface INarrativeDomain {
  processTurn(campaignId: string, action: PlayerAction): Promise<NarrativeTurn>
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const STAT_KEYS = ['edge', 'heart', 'iron', 'shadow', 'wits', 'health', 'spirit', 'supply', 'momentum']

function buildSnapshot(state: CharacterState): CharacterSnapshot {
  const data = state.data as Record<string, unknown>
  const summary = STAT_KEYS
    .filter((k) => typeof data[k] === 'number')
    .map((k) => `${k[0]!.toUpperCase()}${k.slice(1)}:${data[k] as number}`)
    .join(' ')
  return { id: state.id, name: state.name, rulesetId: state.rulesetId, summary, data: state.data }
}

function makeEvent(
  turnId: string,
  campaignId: string,
  type: SessionEventType,
  characterId: string,
  payload: Record<string, unknown>,
): SessionEvent {
  return {
    id: crypto.randomUUID(),
    campaignId,
    turnId,
    type,
    playerId: 'local',
    characterId,
    payload,
    timestamp: new Date().toISOString(),
  }
}

const VALID_ODDS = Object.keys(ODDS_THRESHOLD) as Odds[]

// ── NarrativeDomain ───────────────────────────────────────────────────────────

export class NarrativeDomain implements INarrativeDomain {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly plugin: RulesetPlugin,
    private readonly ai: AIGateway,
    private readonly oracle: IOracleService,
    private readonly dice: IDiceService,
  ) {}

  async processTurn(campaignId: string, action: PlayerAction): Promise<NarrativeTurn> {
    const turnId = crypto.randomUUID()

    // ── Load campaign + character ──────────────────────────────────────────────
    const campaign = await this.storage.campaigns.get(campaignId)
    if (campaign.characterIds.length === 0) throw new Error('Campaign has no characters')
    // TODO: solo-only assumption — multi-character and co-op campaigns require PlayerAction
    // to carry a characterId field so the correct character is selected.
    const character = await this.storage.characters.get(campaign.characterIds[0]!)

    // ── Phase 1: Classify intent ───────────────────────────────────────────────
    const intent: AIIntent =
      action.type === 'move' ? 'skald.move' :
      action.type === 'oracle' ? 'oracle.narrate' :
      'skald.narrate'

    // ── Phase 2: Roll dice (move only) ─────────────────────────────────────────
    let diceRoll: DiceRoll | undefined
    if (action.type === 'move') {
      if (!action.moveId) throw new Error('moveId is required for move actions')
      const modifier =
        action.statKey
          ? ((character.data as Record<string, number>)[action.statKey] ?? 0)
          : 0
      diceRoll = this.dice.roll({ action: 'd6', challenge: ['d10', 'd10'], modifier })
    }

    // ── Phase 3: Resolve move (move only) ─────────────────────────────────────
    let outcome: ReturnType<typeof this.plugin.moves.resolve> | undefined
    if (action.type === 'move' && diceRoll) {
      const move = this.plugin.moves.getAll().find((m) => m.id === action.moveId)
      if (!move) throw new Error(`Unknown move: "${action.moveId}"`)
      outcome = this.plugin.moves.resolve(move, diceRoll, character)
    }

    // ── Phase 4: Assemble GameContext ─────────────────────────────────────────
    const recentEvents = await this.storage.session.getRecent(campaignId, 20)
    const worldEntities = await this.storage.world.list(campaignId)
    const context: GameContext = {
      rulesetId: campaign.rulesetId,
      characters: [buildSnapshot(character)],
      world: { entities: worldEntities, totalEntityCount: worldEntities.length },
      recentEvents,
      // TODO: populate oracleHistory from recentEvents filtered to 'oracle.consulted' type
      oracleHistory: [],
    }

    // ── Phase 5: Oracle ────────────────────────────────────────────────────────
    const oracleRolls: { tableId: string; roll: number; raw: string; timestamp: string }[] = []

    if (action.type === 'move' && outcome) {
      // Auto-trigger oracle on miss — filter to tables the plugin actually has
      const allTables = this.plugin.oracle.getTables()
      const triggerIds = this.oracle
        .detectTriggers(outcome)
        .filter((id) => allTables.some((t) => t.id === id))
      for (const id of triggerIds) {
        const r = this.oracle.roll(id, allTables)
        oracleRolls.push({ tableId: r.tableId, roll: r.roll, raw: r.raw, timestamp: r.timestamp })
      }
    } else if (action.type === 'oracle') {
      const odds: Odds = VALID_ODDS.includes(action.odds as Odds) ? (action.odds as Odds) : 'fifty-fifty'
      const fates = this.oracle.rollAskFates(odds)
      oracleRolls.push({
        tableId: 'ask-the-fates',
        roll: fates.roll,
        raw: fates.result ? 'Yes' : 'No',
        timestamp: fates.timestamp,
      })
    }

    // ── Phase 6: Call AI gateway ───────────────────────────────────────────────
    const response = await this.ai.complete({
      intent,
      context,
      ...(action.userText !== undefined && { userMessage: action.userText }),
    })

    // ── Phase 7: Extract entities, commit character, append events ─────────────

    // Entity extraction — [[Name]] patterns
    const extractedEntities: string[] = []
    const entityPattern = /\[\[([^\]]+)\]\]/g
    let match: RegExpExecArray | null
    while ((match = entityPattern.exec(response.text)) !== null) {
      extractedEntities.push(match[1]!)
    }

    // Apply stat deltas — use d.after (already clamped by move resolver)
    const deltas = outcome?.consequences ?? []
    let updatedCharacter = character
    if (deltas.length > 0) {
      const data = { ...(character.data as Record<string, unknown>) }
      for (const d of deltas) {
        ;(data as Record<string, number>)[d.stat] = d.after
      }
      updatedCharacter = { ...character, data, updatedAt: new Date().toISOString() }
      await this.storage.characters.save(updatedCharacter)
    }

    // Append events in canonical order
    const make = (type: SessionEventType, payload: Record<string, unknown>) =>
      makeEvent(turnId, campaignId, type, character.id, payload)

    // TODO: event appends are not transactional — a mid-turn storage failure produces a
    // partial session log. Requires a batch-append API on StorageAdapter to fix properly.
    await this.storage.session.append(campaignId, make('player.input', { action }))

    if (diceRoll) {
      await this.storage.session.append(campaignId, make('dice.rolled', { diceRoll }))
    }

    if (outcome) {
      await this.storage.session.append(campaignId, make('move.resolved', { moveId: action.moveId, outcome }))
    }

    if (oracleRolls.length > 0) {
      await this.storage.session.append(campaignId, make('oracle.consulted', { oracleRolls }))
    }

    await this.storage.session.append(campaignId, make('skald.narrated', { text: response.text, tokensUsed: response.tokensUsed }))

    if (extractedEntities.length > 0) {
      await this.storage.session.append(campaignId, make('entity.extracted', { entities: extractedEntities }))
    }

    if (deltas.length > 0) {
      await this.storage.session.append(campaignId, make('character.mutated', { deltas }))
    }

    // ── Build and return NarrativeTurn ─────────────────────────────────────────
    return {
      turnId,
      input: action,
      ...(action.moveId !== undefined && { move: action.moveId }),
      ...(diceRoll && outcome && {
        roll: {
          actionDie: diceRoll.actionDie,
          challengeDice: diceRoll.challengeDice,
          modifier: diceRoll.modifier,
          total: diceRoll.total,
          result: outcome.result,
          match: outcome.match,
        },
      }),
      ...(oracleRolls.length > 0 && { oracleResults: oracleRolls }),
      narration: response.text,
      statDeltas: deltas,
      extractedEntities,
      timestamp: new Date().toISOString(),
    }
  }
}
