# Saga Keeper — Platform Architecture Specification
*March 2026 · Version 1.0*

---

## Overview

Saga Keeper is a companion app for Ironsworn, the Norse-mythic solo/duo tabletop RPG. This document specifies the platform architecture that powers it: a tech-agnostic, layered system designed for web-first delivery with clear pivot paths to mobile and desktop, and a ruleset plugin model that supports future expansion to other tabletop games.

### Design Priorities

1. **Ironsworn solo + duo play on web** — the primary target
2. **Platform portability** — web → mobile → desktop without rewriting business logic
3. **Multi-game extensibility** — adding a new TTRPG means writing one plugin, not refactoring the app
4. **Configurable AI assistance** — from fully offline to full AI narrator, user-selectable
5. **Account-optional** — local-first, cloud opt-in

---

## Screen Map

```
Great Hall  (home / campaign management)
│
├── The Forge  (character creation — launched from Great Hall)
│
└── In-session navigation
    ├── Iron Sheet   (character tracker)
    ├── The Oracle   (oracle tables & fate consultation)
    ├── The Skald    (AI narrator / narrative chat)
    └── World Forge  (atlas / entity relationship map)
```

---

## Architecture Layers

### Request Flow

```
UI Layer → Domain API → Service Layer → AI Gateway → LLM Provider
Service Layer → Storage Adapter → Backend / LocalStorage
Realtime Bus ↔ Presence + Sync ↔ Co-op Session
```

---

### L1 — UI / Presentation Layer

Each platform target is a thin shell. All business logic lives below this layer. Swapping React for React Native or Tauri requires no changes to L2–L5.

**Platform shells:**
- **Web Shell** — React + Vite. Responsive, CSS variables, dark mode. Priority target.
- **Mobile Shell** — React Native (future). Touch gestures, native nav, offline-first.
- **Desktop Shell** — Tauri/Electron (future). Native menus, local file system, offline.
- **Design System** — Shared tokens, components, typography. One source across all shells.

**Screen modules (Ironsworn default ruleset):**
- Great Hall — Campaign home, multi-character overview
- The Forge — Character creation wizard
- Iron Sheet — Character tracker, dice roller
- The Oracle — Fate tables, consultation history
- The Skald — AI narrator chat, inline oracle
- World Forge — Atlas, entity graph, NPC tracker

---

### L2 — Domain API (Game-Agnostic Core)

Pure TypeScript interfaces and domain types. No framework, no IO. The UI calls these; implementations live in L3. Swapping rulesets means swapping an L3 plugin without touching L1 or L4.

**Domain interfaces:**

| Domain | Responsibility |
|---|---|
| `CharacterDomain` | Stats, conditions, vows, XP. Ruleset-specific via plugin. |
| `CampaignDomain` | Campaign CRUD, participant roster, session log. |
| `DiceDomain` | Roll engine, outcome resolution, move lookup. |
| `OracleDomain` | Table definitions, consultation, history log. |
| `WorldDomain` | Entities, relations graph, atlas. |
| `NarrativeDomain` | Story log, Skald session, narrative events. |
| `CoopDomain` | Session sync, presence, turn model. |

---

### L3 — Service / Ruleset Layer

Each supported game is a `RulesetPlugin` that implements the L2 interfaces. The Ironsworn plugin ships first.

**Planned plugins:**

| Plugin | Status | Notes |
|---|---|---|
| Ironsworn | MVP | Solo + duo. Full move set, oracle tables, assets. |
| Starforged | v2 | Inherits core; overrides stats, oracles, sector map. |
| Ironsworn: Delve | v2 | Dungeon moves and site tables extension. |
| Custom Plugin SDK | v3 | JSON schema + plugin manifest for community rulesets. |

**Core services:**
- **Dice Service** — Cryptographically fair rolls. Seeded replay for debugging.
- **Oracle Service** — Weighted tables, auto-trigger detection, entity extraction.
- **Session Service** — Campaign state machine, save/restore, history compaction.

---

### L4 — AI Gateway

A provider-agnostic abstraction. Every AI call goes through it. The app never hard-codes a provider — the gateway resolves the call to whatever backend is configured. Context injection (character state, world entities, session history) is handled here, not in the UI.

#### AI Tiers (user-configurable)

| Tier | Features |
|---|---|
| **Offline / Zero AI** | Dice rolls, move resolution, oracle table lookups (random). No LLM calls. Works fully offline. |
| **Assisted** | + Oracle narrative generation, entity extraction, Skald move suggestions, World Forge AI Expand. |
| **Full Skald** | + Full AI narration, auto-oracle during narration, character voice synthesis, campaign arc suggestions. |

#### Core Gateway Interface

```typescript
interface AIGateway {
  complete(request: CompletionRequest): Promise<CompletionResponse>
  stream(request: CompletionRequest): AsyncIterable<StreamChunk>
  getCapabilities(): ProviderCapabilities
  getTier(): AITier
}
```

#### Request Shape

```typescript
interface CompletionRequest {
  // What feature is calling — drives prompt template selection
  intent: AIIntent

  // Assembled context — never raw prompt strings from the UI
  context: GameContext

  // The actual user input or trigger
  userMessage?: string

  // Conversation history (Skald only)
  history?: Message[]

  // Override defaults
  options?: CompletionOptions
}

type AIIntent =
  | 'skald.narrate'      // Skald full narration turn
  | 'skald.move'         // Skald resolving a specific move
  | 'oracle.narrate'     // Wrapping a raw oracle roll in prose
  | 'oracle.extract'     // Entity extraction from oracle result
  | 'world.generate'     // AI Generate NPC / location
  | 'world.expand'       // AI Expand existing entity
  | 'forge.counsel'      // Skald's Counsel in character creation
  | 'hall.reminder'      // Skald's Reminder on Great Hall
```

#### Game Context

```typescript
interface GameContext {
  ruleset: string               // e.g. 'ironsworn-v1'
  characters: CharacterSnapshot[]
  world: WorldSnapshot
  recentEvents: SessionEvent[]  // last N turns, token-budget aware
  oracleHistory: OracleResult[]
  narrativeTone?: NarrativeTone // 'grim' | 'heroic' | 'mythic'
}
```

#### Provider Adapter Interface

```typescript
interface ProviderAdapter {
  id: string                    // 'anthropic' | 'openai' | 'ollama' | 'custom'
  displayName: string

  complete(
    systemPrompt: string,
    messages: Message[],
    options: CompletionOptions
  ): Promise<string>

  stream(
    systemPrompt: string,
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<string>

  getCapabilities(): ProviderCapabilities
}

interface ProviderCapabilities {
  streaming: boolean
  maxContextTokens: number
  supportsSystemPrompt: boolean
  localOnly: boolean         // true for Ollama — affects co-op availability
}
```

#### Request Pipeline

1. **Intent resolution** — Maps `AIIntent` + ruleset to a versioned prompt template.
2. **Context assembly** — Serialises `GameContext` into the system prompt. Trims `recentEvents` oldest-first if context would overflow. Character state and active vows are always preserved.
3. **Tier check** — If current tier doesn't support the intent, returns a deterministic fallback without calling any provider.
4. **Cost guard** — Checks session token spend against the configured budget. Warns at 80%, blocks at 100% and degrades tier.
5. **Provider dispatch** — Calls the active `ProviderAdapter`.
6. **Response parsing** — Extracts structured data where needed (entity tags, move outcomes). Raw narration passes through as-is.
7. **Event emission** — Publishes completion events to `NarrativeDomain`. Skald feed, oracle history, and World Forge entity suggestions are all driven by these events.

#### Planned Providers

| Provider | Status | Notes |
|---|---|---|
| Anthropic (Claude) | MVP | Proxied. Streaming SSE. Default for all tiers. |
| OpenAI | v2 | User-selectable. BYOK or proxied. |
| Ollama (local) | v2 | No API key. `localOnly: true` — disables remote co-op. |
| Custom model | v3+ | Your fine-tuned endpoint. Implements `ProviderAdapter`. Prompt templates tuned separately. |

#### Key AI Gateway Decisions

- **Proxy by default** — API keys are server-side. System prompt templates stay private. Cost controls work. Required for custom model. BYOK available as a power-user option.
- **Prompt ownership** — Templates live in the gateway layer, versioned by ruleset. UI code never contains prompt strings. Tuning for a new model = edit templates only.
- **Degradation path** — Full Skald → Assisted → Offline. Each step is a valid app state, not an error. Budget exhaustion and provider failure both degrade gracefully.
- **Co-op + AI** — Skald narration is generated once per turn server-side and broadcast to both players. Never generated twice. `localOnly` providers disable remote co-op.

---

### L5 — Storage & Sync Layer

The `StorageAdapter` interface isolates all persistence. The app never calls a database directly.

#### Core Interface

```typescript
interface StorageAdapter {
  campaigns: {
    list(): Promise<CampaignSummary[]>
    get(id: string): Promise<Campaign>
    create(data: NewCampaign): Promise<Campaign>
    update(id: string, patch: Partial<Campaign>): Promise<Campaign>
    delete(id: string): Promise<void>
  }

  characters: {
    get(id: string): Promise<Character>
    save(character: Character): Promise<Character>
  }

  session: {
    // Append-only — session log is never edited
    append(campaignId: string, event: SessionEvent): Promise<void>
    getRecent(campaignId: string, limit: number): Promise<SessionEvent[]>
    getAll(campaignId: string): Promise<SessionEvent[]>
  }

  world: {
    list(campaignId: string): Promise<WorldEntity[]>
    get(id: string): Promise<WorldEntity>
    save(entity: WorldEntity): Promise<WorldEntity>
    delete(id: string): Promise<void>
  }

  export(campaignId: string): Promise<CampaignArchive>
  import(archive: CampaignArchive): Promise<Campaign>

  readonly type: 'local' | 'cloud'
  readonly supportsRealtime: boolean
  readonly requiresAuth: boolean
}
```

#### Concrete Adapters

| Adapter | Status | Notes |
|---|---|---|
| `LocalAdapter` | MVP | IndexedDB (web), SQLite (mobile/desktop). No account required. `supportsRealtime: false`. Default for all new users. |
| `CloudAdapter` | v2 | Supabase or Firebase. `requiresAuth: true`, `supportsRealtime: true`. Wraps LocalAdapter as write-through cache. Opt-in. |

#### CampaignArchive — Portable Format

```typescript
interface CampaignArchive {
  version: string              // archive schema version for migration
  exportedAt: string           // ISO timestamp
  rulesetId: string            // plugin needed to restore
  campaign: Campaign
  characters: Character[]
  world: WorldEntity[]
  sessionLog: SessionEvent[]   // complete history
}
// Stored as .sagakeeper.json — human-readable, git-friendly
```

---

## Sync Model

### What Syncs and How

| Data | Sync Strategy | Notes |
|---|---|---|
| Character state | Owner-only write | One writer per character. Last-write-wins. Other players receive read-only snapshots. |
| Session log / Skald feed | Append-only + broadcast | Events appended server-side, broadcast to all participants. Immutable. |
| World Forge entities | CRDT merge | Both players can edit concurrently. Last-write-wins per field, vector clocks per entity. |
| Private notes | Local-only | Never leaves the device. CloudAdapter explicitly excludes from sync scope. |

### Realtime Bus Events

```typescript
type RealtimeEvent =
  | { type: 'session.event';    payload: SessionEvent }
  | { type: 'character.patch';  payload: CharacterPatch;  owner: string }
  | { type: 'world.patch';      payload: WorldPatch;      vector: VectorClock }
  | { type: 'presence.update';  payload: PresenceState }
  | { type: 'turn.lock';        payload: TurnLockState }
  | { type: 'turn.unlock';      payload: { actingPlayer: string } }
```

### Offline → Online Transition

**Upgrading a local campaign:**
1. User opts into cloud sync
2. Auth prompt — create account
3. `LocalAdapter.export()` → `CampaignArchive`
4. `CloudAdapter.import(archive)`
5. App swaps adapter reference
6. Local copy kept as backup

**Reconnect after drop:**
1. Local writes buffered in queue during gap
2. On reconnect: replay buffered events
3. Server reconciles append-only log
4. CRDT merge for world entities
5. Character state: owner pushes latest snapshot
6. UI shows Sync button while gap is open

---

## Co-op Session Model

### Modes

| Mode | Description |
|---|---|
| **Same-PC** | Character switcher in UI. No network. Both characters on one device. Input bar border color tracks active character. |
| **Remote** | Share link → both players join on their own devices. Shared Skald feed, private notes stay local. |

### Shared vs Private

| Shared | Private |
|---|---|
| Skald chat feed | Each player's private notes |
| World Forge | Character secrets / hidden motivations |
| Oracle history | Information one character doesn't have |
| Vow progress | |

### Turn Lock

Optional setting that pauses the Skald from advancing until both players confirm. An "Act Now" override allows one player to push ahead. Presence indicators in the header show online/away per character.

---

## Ruleset Plugin Contract

### Plugin Manifest

```typescript
interface RulesetManifest {
  id: string               // 'ironsworn-v1', 'starforged-v1'
  displayName: string
  version: string
  author: string
  playerCount: { min: number; max: number }
  features: RulesetFeature[]
}

type RulesetFeature =
  | 'vows'           // progress track vows
  | 'assets'         // asset cards
  | 'oracle-tables'  // fate consultation tables
  | 'world-truths'   // setting customisation (Ironsworn)
  | 'sectors'        // sector map (Starforged)
  | 'legacy-tracks'  // legacy XP tracks (Starforged)
```

### Core Plugin Interface

```typescript
interface RulesetPlugin {
  manifest: RulesetManifest

  character: {
    schema: JSONSchema
    defaults(): CharacterState
    applyCondition(state, condition, active): CharacterMutation
    momentumReset(state): number
    canAdvance(state, cost): boolean
  }

  moves: {
    getAll(): Move[]
    getByCategory(cat: MoveCategory): Move[]
    resolve(move, roll, state): MoveOutcome
    suggest(context: SceneContext): Move[]
  }

  oracle: {
    getTables(): OracleTable[]
    roll(tableId: string): OracleRoll
    rollAskFates(odds: Odds): FatesResult
  }

  assets: {
    getAll(): Asset[]
    getByType(type: AssetType): Asset[]
  }

  creation: {
    steps: CreationStep[]
    statBudget: number[]
    validate(partial): ValidationResult
  }
}
```

### MoveOutcome

```typescript
interface MoveOutcome {
  result: 'strong-hit' | 'weak-hit' | 'miss'
  match: boolean                  // doubles on challenge dice
  consequences: StatDelta[]       // health, spirit, supply, momentum changes
  narrativeHints: string[]        // injected into Skald context
  followUpMoves?: Move[]          // suggested next moves
}
```

---

## Ironsworn Plugin — Reference Implementation

### Manifest

```typescript
const ironswornManifest: RulesetManifest = {
  id: 'ironsworn-v1',
  displayName: 'Ironsworn',
  version: '1.0.0',
  author: 'Shawn Tomkin',
  playerCount: { min: 1, max: 2 },
  features: ['vows', 'assets', 'oracle-tables', 'world-truths']
}
```

### Character Schema

```typescript
interface IronswornCharacter extends CharacterState {
  // Core stats
  edge: number; heart: number; iron: number
  shadow: number; wits: number

  // Condition meters
  health: number     // 0–5
  spirit: number     // 0–5
  supply: number     // 0–5
  momentum: number   // -6 to +10

  // Debilities
  debilities: {
    wounded: boolean;    shaken: boolean
    unprepared: boolean; encumbered: boolean
    maimed: boolean;     corrupted: boolean
    cursed: boolean;     tormented: boolean
    weak: boolean
  }

  vows: Vow[]          // rank: troublesome|dangerous|formidable|extreme|epic
  bonds: Bond[]
  assets: AssetCard[]  // max 3 starting, expandable
  experience: { earned: number; spent: number }
}
```

### Move Categories

**Adventure:** Face Danger, Secure an Advantage, Gather Information, Heal, Resupply, Make Camp, Undertake a Journey, Reach Your Destination, Aid Your Ally, Write in Your Journal.

**Combat:** Enter the Fray, Strike, Clash, Turn the Tide, End the Fight, Battle, Face Death, Face Desolation.

**Fate / Vows:** Swear an Iron Vow, Reach a Milestone, Fulfill Your Vow, Forsake Your Vow, Compel, Forge a Bond, Test Your Bond, Aid Your Ally.

### Oracle Tables

`ask-the-oracle` · `action` · `theme` · `place-name` · `npc-name` · `character-role` · `settlement` · `location` · `combat-action` · `plot-twist` · `major-plot-twist` · `mystic-backlash` · `challenge-rank`

---

## Skald Turn — Full Data Flow

A single Skald turn touches every layer of the architecture. This is the happy path for a move-triggered turn.

### Phase 1 — Player Input (L1 · UI)

1. Player types free text or taps a quick-move pill in the Skald input bar.
2. If a move requires a stat roll, the active stat is read from `CharacterState`.
3. UI emits a typed `PlayerAction` to `NarrativeDomain` — it never calls the AI Gateway directly.

```typescript
type PlayerAction =
  | { type: 'move';   moveId: string; statKey: string; userText?: string }
  | { type: 'free';   userText: string }
  | { type: 'oracle'; question: string; odds?: Odds }
```

**Co-op:** In Remote mode, `CoopDomain` validates the sender is the character's owner before proceeding.

**Branch — oracle-only:** Player asks a yes/no question → classifies as Ask the Fates → jumps to Phase 4, skipping dice resolution.

**Branch — free narrative:** "I examine the body." → no move triggered → jumps to Phase 5, skipping dice and oracle phases.

### Phase 2 — Intent Classification + Dice Resolution (L3 · Service)

1. `NarrativeDomain` classifies the action: keyword matching against the move catalogue first, AI-assisted fallback if ambiguous.
2. `DiceService` rolls 1d6 + stat (action die) and 2d10 (challenge dice). Roll is seeded, stored, and replayable.
3. `IronswornPlugin.moves.resolve()` returns a `MoveOutcome`. Character state is updated and persisted immediately.
4. Move outcome card renders in the Skald feed — the player sees the result before narration begins.

```typescript
DiceService.roll({ action: 'd6', challenge: ['d10', 'd10'], modifier: statValue })
```

### Phase 3 — Context Assembly (L4 · AI Gateway)

1. `GameContext` snapshot built: character stats + conditions + vows, party state (duo), relevant world entities, recent session events, oracle history.
2. Token budget applied. Priority: character state (always) → active vow (always) → last 3 turns (always) → top 10 world entities by recency → older history (trimmed oldest-first).
3. System prompt assembled from versioned template selected by `intent` + `rulesetId`. Includes: Skald persona, Ironsworn tone and rules, character voice, `MoveOutcome` injected verbatim, narrative hints.

```typescript
PromptTemplate.render('ironsworn-v1', 'skald.move', { context, outcome })
```

### Phase 4 — Oracle Auto-Trigger (conditional) (L3 + L4)

The Skald auto-consults the oracle when the move outcome or scene creates an open question — before the main narration call, so oracle results are woven into the Skald's response.

1. `OracleService` scans `MoveOutcome` narrative hints and scene context for trigger signals. Weak-hit always prompts a complication check; miss always prompts a threat roll.
2. Appropriate table rolled. Raw result stored to oracle history immediately.
3. Oracle result injected into system prompt context before narration call. The Skald weaves it in naturally.

**Co-op:** Oracle rolls happen once, server-side. Result broadcast to both players as a `session.event` before narration begins.

### Phase 5 — AI Narration (L4 · AI Gateway)

1. Gateway dispatches to the active `ProviderAdapter`. Response streams as SSE tokens.
2. UI renders the Skald bubble progressively as tokens arrive.
3. Stream completes — full response available in `NarrativeDomain` buffer.

**Tier degradation:**
- Assisted: same flow as Full Skald here.
- Offline: Phase 5 skipped entirely. Move outcome card and raw oracle result shown. Player narrates themselves.

### Phase 6 — Entity Extraction + World Forge Update (L3 + L4)

Runs in parallel after Phase 5 completes. Does not block the UI.

1. Lightweight AI call (`oracle.extract` intent) scans completed narration for named entities: NPCs, locations, threats, factions. Returns structured JSON.
2. New entities appear as chip suggestions below the Skald narration. One tap to add — no form required.
3. Accepted entities written to `WorldDomain` via `StorageAdapter`. In Remote co-op: `world.patch` CRDT event broadcast to both players.

### Phase 7 — Session Log + State Commit (L3 · Storage)

1. One atomic `SessionEvent` captures the full turn.
2. `StorageAdapter.session.append()` — written to IndexedDB (local) or cloud. In Remote co-op this is the authoritative broadcast.
3. `CharacterState` committed — stat deltas applied and persisted. Iron Sheet updates reactively.
4. Input bar re-enables. Quick-move pills re-evaluate context.

```typescript
interface SessionEvent {
  turnId: string
  playerId: string
  input: PlayerAction
  move?: Move
  roll?: DiceRoll
  oracle?: OracleRoll[]
  narration: string
  stateDelta: StatDelta[]
  entities: WorldEntity[]
  timestamp: string
}
```

**Co-op with turn lock:** Input bar stays disabled on both devices until both players confirm. Act Now override skips the lock immediately.

### Turn Latency Budget

| Visible immediately | Runs after narration renders |
|---|---|
| Move outcome card (Phase 2 complete) | Entity extraction (~1s) |
| Oracle strip if triggered (Phase 4 complete) | Entity chip suggestions below narration |
| Skald typing indicator (Phase 5 start) | Session log write (async, invisible) |
| Narration tokens streaming in | Character state commit (reactive) |

### Invariants

- The UI never constructs a prompt.
- The UI never calls a provider SDK.
- The UI never writes to storage directly.
- The UI never reads from storage during a turn — it reacts to domain events.
- Every layer boundary is preserved under load.

---

## Multi-Game Pivot Strategy

Adding a new game means writing one `RulesetPlugin` at L3. All other layers are already game-agnostic.

### Must Implement (per new game)

- `RulesetPlugin` interface
- Character schema (JSON Schema)
- Move definitions + resolver
- Oracle table set
- Asset / ability list
- Forge creation step sequence

### Reused As-Is

- All UI shells (web, mobile, desktop)
- AI Gateway + context builder
- Storage adapters
- Co-op session model
- Design system

### Plugin Roadmap

1. Ironsworn (MVP)
2. Starforged + Ironsworn: Delve (v2)
3. Custom Plugin SDK — JSON schema + manifest for community plugins (v3)

---

## Locked Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Account model | Account-optional | Zero friction for solo players. Cloud sync opt-in at co-op gate. |
| Co-op transport | WebSocket (Supabase/Partykit) for MVP | Low ops overhead. WebRTC stays on table for future peer-to-peer. |
| AI provider MVP | Anthropic (proxied) | Best narrative quality. Proxy protects prompts and enables cost control. |
| Provider exposure | User-selectable (not MVP) | Power users can choose. Custom model slot reserved at v3+. |
| Prompt ownership | Gateway layer only | Templates are versioned files. UI has no prompt strings. |
| Storage default | LocalAdapter (IndexedDB) | Works offline, no account required. |
| Session log | Append-only | Simplifies sync. Enables complete chronicle replay. Crash-safe. |
| Custom model path | `ProviderAdapter` implementation | Zero app-layer changes. Template tuning only. |

---

*Saga Keeper platform spec — generated from architecture design session, March 2026*
