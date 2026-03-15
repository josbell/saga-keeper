# Saga Keeper

> AI-powered tabletop RPG companion — solo and duo play, starting with Ironsworn.

---

## What it is

Saga Keeper is a companion app that eliminates the need to tab away mid-session. Oracle consultations, move resolution, stat tracking, and AI narration all happen inline. The story never stops.

**Current support:** Ironsworn (solo + duo)  
**Planned:** Starforged, Ironsworn: Delve, custom ruleset SDK

---

## Monorepo structure

```
saga-keeper/
├── apps/
│   └── web/                        # React + Vite (MVP target)
├── packages/
│   ├── domain/                     # L2 — game-agnostic TypeScript interfaces
│   ├── services/                   # L3 — core services (Dice, Oracle, Session, Narrative)
│   ├── ai-gateway/                 # L4 — provider-agnostic AI gateway
│   ├── storage/                    # L5 — LocalAdapter + CloudAdapter
│   ├── ui/                         # Shared design system and components
│   └── rulesets/
│       └── ironsworn/              # Reference RulesetPlugin implementation
└── docs/
    ├── saga-keeper-platform-spec.md    # Architecture specification (this project)
    └── saga-keeper-design-notes.md    # UI design notes and mockup commentary
```

---

## Architecture overview

Five strict layers. Each layer only talks to the one below it. No layer skips.

| Layer | Package | Role |
|---|---|---|
| L1 | `apps/web` | UI shell — React. Platform-specific. Zero business logic. |
| L2 | `@saga-keeper/domain` | Game-agnostic interfaces and types. No IO. |
| L3 | `@saga-keeper/services` + rulesets | Rules engine, dice, oracle, session orchestration. |
| L4 | `@saga-keeper/ai-gateway` | Provider-agnostic AI — context assembly, prompt templates, streaming. |
| L5 | `@saga-keeper/storage` | StorageAdapter — IndexedDB (local) or cloud sync. |

Full specification: [`docs/saga-keeper-platform-spec.md`](./docs/saga-keeper-platform-spec.md)

---

## Getting started

**Prerequisites:** Node 20+, pnpm 9+

```bash
# Clone and install
git clone https://github.com/your-org/saga-keeper.git
cd saga-keeper
pnpm install

# Run the web app in dev mode
pnpm dev

# Typecheck all packages
pnpm typecheck

# Run all tests
pnpm test

# Build everything
pnpm build
```

---

## Adding a new ruleset

1. Create `packages/rulesets/<game-id>/`
2. Implement `RulesetPlugin` from `@saga-keeper/domain`
3. Define manifest, character schema, moves, oracle tables, assets, creation steps
4. Register the plugin in `apps/web/src/lib/plugins.ts`

Nothing in L1, L4, or L5 needs to change. See `packages/rulesets/ironsworn/` as the reference implementation and `docs/saga-keeper-platform-spec.md` §5 for the full plugin contract.

---

## AI configuration

Three tiers, user-selectable in settings:

| Tier | What works |
|---|---|
| Offline | Dice rolls, move resolution, raw oracle tables. No LLM. |
| Assisted | + Oracle narrative, entity extraction, move suggestions. |
| Full Skald | + Complete AI narration, auto-oracle, campaign arc suggestions. |

Provider is configurable. MVP ships with Anthropic (proxied). OpenAI and local (Ollama) adapters planned for v2. Custom model slot reserved — see `packages/ai-gateway/src/adapters/`.

---

## Co-op

| Mode | How |
|---|---|
| Same-PC | Character switcher in the Skald input bar. No network required. |
| Remote | Share link → both players join. Shared Skald feed, private notes stay local. |

---

## Tech stack

| Concern | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web app | React 18 + Vite |
| Language | TypeScript (strict) |
| Testing | Vitest |
| Storage (local) | IndexedDB via Dexie.js |
| Storage (cloud) | Supabase (v2) |
| AI provider (MVP) | Anthropic Claude (proxied) |
| Fonts | Cinzel Decorative + Cinzel (Google Fonts) |

---

## Implementation status

| Package | Status |
|---|---|
| `@saga-keeper/domain` | ✅ Interfaces complete |
| `@saga-keeper/ruleset-ironsworn` | 🔲 Scaffold only — implement moves, oracle tables, assets |
| `@saga-keeper/services` | 🔲 Interfaces defined — implement DiceService, OracleService, NarrativeDomain |
| `@saga-keeper/ai-gateway` | 🔲 Interfaces defined — implement ContextBuilder, AnthropicAdapter, pipeline |
| `@saga-keeper/storage` | 🔲 Interfaces defined — implement LocalAdapter |
| `@saga-keeper/ui` | 🔲 Tokens only — implement components |
| `apps/web` | 🔲 Scaffold only — implement all six screens |

---

*Saga Keeper · Started March 2026*
