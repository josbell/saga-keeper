# CLAUDE.md — saga-keeper

Agent context for this monorepo. Read this before touching any code.

---

## What this project is

**saga-keeper** is a TTRPG companion app (MVP target: Ironsworn). It is a React + TypeScript web app in a pnpm monorepo. The architecture is strictly layered to support future rulesets and AI providers as drop-in plugins.

---

## Monorepo layout

```
saga-keeper/
├── apps/web/                     # L1 — React + Vite web app (the UI shell)
├── packages/
│   ├── domain/                   # L2 — game-agnostic interfaces/types only (zero runtime logic)
│   ├── services/                 # L3 — NarrativeDomain, DiceService, OracleService, etc.
│   ├── ai-gateway/               # L4 — provider-agnostic AI abstraction
│   ├── storage/                  # L5 — StorageAdapter + LocalAdapter (IndexedDB/Dexie)
│   ├── ui/                       # Shared design system components
│   └── rulesets/ironsworn/       # Reference RulesetPlugin implementation
├── docs/                         # Platform spec + design notes (authoritative)
└── .github/workflows/ci.yml      # CI pipeline
```

**Package manager:** pnpm 9 with workspaces. **Build orchestration:** Turborepo 2.

---

## Tech stack

| Concern | Technology |
|---------|-----------|
| Language | TypeScript 5.4+, **strict mode + exactOptionalPropertyTypes** |
| UI | React 18.3 + Vite 5.4 |
| Routing | react-router-dom 7 |
| State | Zustand 5 |
| Testing | Vitest 1.6 + @testing-library/react 16, happy-dom |
| Storage | Dexie.js 4 (IndexedDB); fake-indexeddb in tests |
| AI SDK | @anthropic-ai/sdk 0.80+ |
| Validation | Zod 4 |
| Lint/Format | ESLint 9 + Prettier 3 |

---

## Layer rules (CRITICAL — never violate)

Dependencies only flow **downward**. No layer may import from a layer above it.

| Layer | Package | Rule |
|-------|---------|------|
| L1 | `apps/web` | UI only. No business logic. Calls L3 via provider hooks. |
| L2 | `@saga-keeper/domain` | Interfaces and types only. Zero IO, zero runtime logic. Everything depends on this. |
| L3 | `@saga-keeper/services` + `@saga-keeper/ruleset-*` | Business logic, rules engine. Returns state deltas — never writes to store. |
| L4 | `@saga-keeper/ai-gateway` | AI abstraction. Depends on L2 only. |
| L5 | `@saga-keeper/storage` | Storage adapters. Depends on L2 only. |

**Adding a new TTRPG** = implement `RulesetPlugin` (see `packages/rulesets/ironsworn/` as reference). No other files change.

---

## Common commands

```bash
pnpm dev          # Start all dev servers (Vite on :5173)
pnpm test         # Run all tests via Turbo
pnpm typecheck    # tsc --noEmit across all packages
pnpm lint         # ESLint across all packages
pnpm build        # Full build (packages first, then web app)
pnpm clean        # Remove all dist/ and node_modules
```

CI runs `typecheck → test → build` on every PR. All three must pass.

---

## Screen architecture (L1)

Six top-level screens, each in `apps/web/src/screens/{screen-name}/`:

```
{screen-name}/
├── index.tsx                    # Re-exports the screen
├── {ScreenName}Screen.tsx       # Root component
├── {ScreenName}.module.css      # Scoped styles
├── components/{ComponentName}/
│   ├── {ComponentName}.tsx
│   ├── {ComponentName}.test.tsx
│   └── {ComponentName}.module.css
├── hooks/                       # Custom hooks (e.g. useSkaldTurn)
└── utils/                       # Pure functions
```

Routing is in `apps/web/src/App.tsx`. Catch-all redirects to `/great-hall`.

**Screens:** Great Hall (`/great-hall`), The Forge (`/forge`), Iron Sheet (`/iron-sheet`), Oracle (`/oracle`), Skald (`/skald`), World Forge (`/world-forge`).

---

## State management

Single Zustand store: `useGameStore` at `apps/web/src/store/index.ts`.

**Five slices:**

| Slice | Key state | Key actions |
|-------|-----------|-------------|
| `characterSlice` | `character: CharacterState \| null` | `setCharacter`, `patchCharacterData` |
| `skaldFeedSlice` | `messages`, `phase: TurnPhase`, `streamBuffer` | `appendMessage`, `setPhase`, `appendToStream`, `flushStream` |
| `oracleSlice` | `oracleHistory`, `lastRoll` | `recordRoll`, `clearHistory` |
| `worldSlice` | `entities: WorldEntity[]` | `addEntity`, `updateEntity`, `removeEntity` |
| `sessionSlice` | `campaign`, `turns`, `events`, `pendingAction`, `activeTurnId` | `setCampaign`, `appendEvent`, `setPendingAction` |

**Cross-slice action: `applyTurnResult(result: TurnResult)`**
Called from `useSkaldTurn` after `NarrativeDomain.processTurn()` resolves. Atomically fans the result into feed, session, and character slices in one `set()` call. This is the canonical way to commit a completed turn.

**TurnPhase flow:** `idle → resolving → waiting-for-ai → streaming → idle` (or `error`).

**Data flow:**
1. User submits action in `SkaldInputBar`
2. `useSkaldTurn` hook calls `NarrativeDomain.processTurn()`
3. Service returns `TurnResult` (messages, stat deltas, events)
4. Hook calls `applyTurnResult(result)`
5. Components re-render via selectors

---

## L3 dependency injection

`apps/web/src/providers/NarrativeDomainProvider.tsx` builds the entire service graph once via `useMemo`:
- `LocalAdapter` → `OracleService` → `OfflineAIGateway` → `DiceService` → `NarrativeDomain`

Hooks: `useNarrativeDomain()`, `useCampaignOps()`.

L1 components never import from `@saga-keeper/services` directly — always go through these hooks.

---

## Testing conventions (TDD-first)

- Write test file before implementation. Every component gets a `{Component}.test.tsx`.
- Use `describe` / `it` blocks. Arrange/act/assert pattern.
- Reset store between tests: `useGameStore.setState(useGameStore.getInitialState())`
- Mock functions: `vi.fn<[ArgType], ReturnType>()`; clear with `.mockClear()`
- Test accessibility: use `getByRole`, `aria-label`, `aria-current`, landmarks
- Import path alias: `@/` → `apps/web/src/`
- DOM env: `happy-dom` (configured in `vitest.config.ts`)

**Commit convention:** `feat(scope): add ComponentName (TDD)` for test-first additions.

---

## TypeScript conventions

- Full strict mode + `exactOptionalPropertyTypes` — no shortcuts
- `import type { T }` for type-only imports
- Casting plugin data: `data as unknown as IronswornCharacterData` inside the plugin package only — never export the double-cast
- Non-null assertions (`!`) are acceptable when you have evidence the value is present
- No implicit `any`

---

## CSS conventions

- CSS Modules for all component styles (`{Component}.module.css`)
- Global styles at `apps/web/src/index.css`
- Fonts: Cinzel Decorative + Cinzel (Google Fonts)
- Portals (`createPortal`) for overlays/popovers to escape `overflow:hidden` containers

---

## Key files to know

| File | Purpose |
|------|---------|
| `apps/web/src/App.tsx` | Route definitions |
| `apps/web/src/store/index.ts` | Zustand store + `applyTurnResult` |
| `apps/web/src/store/slices/` | One file per slice |
| `apps/web/src/providers/NarrativeDomainProvider.tsx` | L3 service graph |
| `packages/domain/src/types/` | All shared interfaces (start here for domain types) |
| `packages/rulesets/ironsworn/src/IronswornPlugin.ts` | Reference plugin |
| `docs/saga-keeper-platform-spec.md` | Authoritative architecture spec |
| `turbo.json` | Build pipeline configuration |
| `.github/workflows/ci.yml` | CI: typecheck → test → build |

---

## What to check before opening a PR

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm test` — all tests pass
- [ ] `pnpm lint` — zero warnings
- [ ] New components have a `.test.tsx` with accessibility assertions
- [ ] New store actions are tested in `store/index.test.ts`
- [ ] No layer boundaries violated (L1 never imports L3 directly, etc.)
- [ ] Commits follow `feat(scope):` / `fix(scope):` convention
