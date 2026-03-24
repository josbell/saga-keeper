// NarrativeDomain — orchestrates a full Skald turn (spec §8)
import type {
  PlayerAction,
  TurnResult,
  OracleResultRecord,
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
import type { IOracleService } from '../oracle/OracleService'
import type { IDiceService } from '../dice/DiceService'

export interface INarrativeDomain {
  processTurn(campaignId: string, action: PlayerAction): Promise<TurnResult>
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const STAT_KEYS = [
  'edge',
  'heart',
  'iron',
  'shadow',
  'wits',
  'health',
  'spirit',
  'supply',
  'momentum',
]

function buildSnapshot(state: CharacterState): CharacterSnapshot {
  const data = state.data as Record<string, unknown>
  const summary = STAT_KEYS.filter((k) => typeof data[k] === 'number')
    .map((k) => `${k[0]!.toUpperCase()}${k.slice(1)}:${data[k] as number}`)
    .join(' ')
  return { id: state.id, name: state.name, rulesetId: state.rulesetId, summary, data: state.data }
}

function makeEvent(
  turnId: string,
  campaignId: string,
  type: SessionEventType,
  characterId: string,
  payload: Record<string, unknown>
): SessionEvent {
  return {
    id: crypto.randomUUID(),
    campaignId,
    turnId,
    type,
    // TODO: 'local' assumes solo/single-device play. Co-op attribution requires
    // processTurn() to accept a playerId parameter from the calling context.
    playerId: 'local',
    characterId,
    payload,
    timestamp: new Date().toISOString(),
  }
}

// ── NarrativeDomain ───────────────────────────────────────────────────────────

export class NarrativeDomain implements INarrativeDomain {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly plugin: RulesetPlugin,
    private readonly ai: AIGateway,
    private readonly oracle: IOracleService,
    private readonly dice: IDiceService
  ) {}

  async processTurn(campaignId: string, action: PlayerAction): Promise<TurnResult> {
    const turnId = crypto.randomUUID()

    // ── Load campaign + character ──────────────────────────────────────────────
    const campaign = await this.storage.campaigns.get(campaignId)
    const charId = action.characterId ?? campaign.characterIds[0]
    if (!charId) throw new Error('Campaign has no characters')
    if (!campaign.characterIds.includes(charId))
      throw new Error(`Character "${charId}" does not belong to campaign "${campaignId}"`)
    // Character is always loaded regardless of action type: all turn types (move, oracle,
    // free) include a character snapshot in the GameContext sent to the AI gateway.
    const character = await this.storage.characters.get(charId)

    // ── Phase 1: Classify intent ───────────────────────────────────────────────
    const intent: AIIntent =
      action.type === 'move'
        ? 'skald.move'
        : action.type === 'oracle'
          ? 'oracle.narrate'
          : 'skald.narrate'

    // ── Phase 2: Roll dice (move only) ─────────────────────────────────────────
    let diceRoll: DiceRoll | undefined
    if (action.type === 'move') {
      if (!action.moveId) throw new Error('moveId is required for move actions')
      const modifier = action.statKey
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
    const oracleRolls: OracleResultRecord[] = []

    if (action.type === 'move' && outcome) {
      // Auto-trigger oracle on miss — filter to tables the plugin actually has
      const allTables = this.plugin.oracle.getTables()
      const triggerIds = this.oracle
        .detectTriggers(outcome)
        .filter((id) => allTables.some((t) => t.id === id))
      for (const id of triggerIds) {
        const r = this.oracle.roll(id, allTables)
        oracleRolls.push({
          tableId: r.tableId,
          roll: r.roll,
          raw: r.raw,
          timestamp: r.timestamp,
          ...(r.seed !== undefined && { seed: r.seed }),
        })
      }
    } else if (action.type === 'oracle') {
      const odds: Odds = action.odds ?? 'fifty-fifty'
      const fates = this.oracle.rollAskFates(odds)
      oracleRolls.push({
        tableId: 'ask-the-fates',
        roll: fates.roll,
        raw: fates.result ? 'Yes' : 'No',
        timestamp: fates.timestamp,
        ...(fates.seed !== undefined && { seed: fates.seed }),
      })
    }

    // ── Phase 6: Call AI gateway ───────────────────────────────────────────────
    const isOffline = this.ai.getTier() === 'offline'
    let narration = ''
    let tokensUsed = 0
    if (!isOffline) {
      const response = await this.ai.complete({
        intent,
        context,
        ...(action.userText !== undefined && { userMessage: action.userText }),
      })
      narration = response.text
      tokensUsed = response.tokensUsed
    }

    // ── Phase 7: Extract entities, commit character, append events ─────────────

    // Entity extraction — [[Name]] patterns
    const extractedEntities: string[] = []
    const entityPattern = /\[\[([^\]]+)\]\]/g
    let match: RegExpExecArray | null
    while ((match = entityPattern.exec(narration)) !== null) {
      extractedEntities.push(match[1]!)
    }

    // Apply stat deltas — use d.after (already clamped by move resolver)
    const deltas = outcome?.consequences ?? []
    if (deltas.length > 0) {
      const data = { ...(character.data as Record<string, unknown>) }
      for (const d of deltas) {
        ;(data as Record<string, number>)[d.stat] = d.after
      }
      await this.storage.characters.save({
        ...character,
        data,
        updatedAt: new Date().toISOString(),
      })
    }

    // Collect events in canonical order, then commit atomically
    const make = (type: SessionEventType, payload: Record<string, unknown>) =>
      makeEvent(turnId, campaignId, type, character.id, payload)

    const events: SessionEvent[] = []
    events.push(make('player.input', { action }))
    if (diceRoll) events.push(make('dice.rolled', { diceRoll }))
    if (outcome) events.push(make('move.resolved', { moveId: action.moveId, outcome }))
    if (oracleRolls.length > 0) events.push(make('oracle.consulted', { oracleRolls }))
    events.push(make('skald.narrated', { text: narration, tokensUsed }))
    if (extractedEntities.length > 0)
      events.push(make('entity.extracted', { entities: extractedEntities }))
    if (deltas.length > 0) events.push(make('character.mutated', { deltas }))

    await this.storage.session.appendBatch(campaignId, events)

    // ── Build and return TurnResult ───────────────────────────────────────────
    return {
      turnId,
      input: action,
      ...(action.moveId !== undefined && { move: action.moveId }),
      ...(diceRoll &&
        outcome && {
          roll: {
            actionDie: diceRoll.actionDie,
            challengeDice: diceRoll.challengeDice,
            modifier: diceRoll.modifier,
            total: diceRoll.total,
            result: outcome.result,
            match: outcome.match,
            ...(diceRoll.seed !== undefined && { seed: diceRoll.seed }),
          },
        }),
      ...(oracleRolls.length > 0 && { oracleResults: oracleRolls }),
      narration,
      statDeltas: deltas,
      ...(outcome !== undefined && { outcome }),
      extractedEntities,
      timestamp: new Date().toISOString(),
      sessionEvents: events,
    }
  }
}
