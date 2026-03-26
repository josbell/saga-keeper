# CLAUDE.md — @saga-keeper/domain

## What this package is

The **foundational type layer (L2)**. Every other package in the monorepo imports from here. This package depends on nothing — no runtime dependencies, no framework, no IO.

**The single rule: no runtime logic allowed here.** No functions with implementations, no class methods, no side effects, no imports from other packages. Interfaces and type aliases only.

If you are tempted to add a helper function, a default value factory, or any executable code — it belongs in `@saga-keeper/services` (L3), not here.

---

## File map

All types live in `src/types/`. Import via `@saga-keeper/domain` (barrel export from `src/index.ts`).

| File | What it defines |
|------|----------------|
| `character.ts` | `CharacterState`, `CharacterSnapshot`, `CharacterMutation`, `StatDelta` |
| `campaign.ts` | `Campaign`, `CampaignSummary`, `NewCampaign`, `CampaignStatus`, `CampaignMode` |
| `session.ts` | `NarrativeTurn`, `TurnResult`, `SessionEvent`, `SessionEventType`, `PlayerAction`, `DiceRollRecord`, `OracleResultRecord` |
| `world.ts` | `WorldEntity`, `EntityConnection`, `WorldSnapshot`, `WorldPatch`, `EntityType` |
| `dice.ts` | `DiceRollRequest`, `DiceRoll`, `DieType` |
| `oracle.ts` | `OracleTable`, `OracleEntry`, `OracleRoll`, `FatesResult`, `Odds` |
| `ruleset.ts` | `RulesetPlugin`, `RulesetManifest`, `Move`, `MoveOutcome`, `Asset`, `CreationStep`, `ValidationResult`, `SceneContext`, `RulesetFeature`, `MoveCategory`, `AssetType`, `CreationStepComponent` |
| `ai.ts` | `AIGateway`, `ProviderAdapter`, `CompletionRequest`, `CompletionResponse`, `StreamChunk`, `GameContext`, `AITier`, `AIIntent`, `NarrativeTone`, `ProviderCapabilities`, `Message`, `CompletionOptions`, `EventGenerationContext`, `NPCGenerationContext` |
| `storage.ts` | `StorageAdapter`, `CampaignArchive` |
| `coop.ts` | `CoopSession`, `CoopMode`, `PresenceState`, `TurnLockState`, `CharacterPatch`, `RealtimeEvent` |

---

## Key design patterns

### Plugin-agnostic character data
`CharacterState.data` is `Record<string, unknown>`. Game-specific fields live there.
Ruleset packages cast it internally: `data as unknown as IronswornCharacterData`.
**Never put game-specific fields directly on `CharacterState`.**

### Three main plugin interfaces
- **`RulesetPlugin`** — implement this to add a new TTRPG ruleset
- **`AIGateway`** — implement this to add a new AI provider
- **`StorageAdapter`** — implement this to add a new storage backend

Each has exactly one reference implementation to follow:
- `packages/rulesets/ironsworn/` → `RulesetPlugin`
- `packages/ai-gateway/` → `AIGateway`
- `packages/storage/` → `StorageAdapter`

### TurnResult is the L3→L1 contract
`TurnResult` (in `session.ts`) is what `NarrativeDomain.processTurn()` returns. It contains the full `NarrativeTurn` plus the list of `SessionEvent`s produced. L1 commits this to the store via `applyTurnResult()`. Do not change this shape without updating both L3 and the Zustand store.

### Append-only session log
`SessionEvent` records are immutable. Sessions are replayed from the log. Seeds on `DiceRollRecord` and `OracleResultRecord` make rolls deterministic for replay.

---

## What NOT to do here

- No `import` from any other `@saga-keeper/*` package
- No `import` from npm packages (no Zod, no Dexie, no React)
- No `function` implementations or `class` definitions
- No default values or factory patterns
- No `console.log` or any IO
