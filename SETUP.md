# First-time setup

Run these commands after cloning or downloading this scaffold:

```bash
# 1. Initialise git (if not already a repo)
git init
git add .
git commit -m "chore: initial monorepo scaffold"

# 2. Install dependencies
pnpm install

# 3. Verify everything typechecks
pnpm typecheck

# 4. Start the web app
pnpm dev
```

## Next implementation steps (in order)

1. **`@saga-keeper/services` — DiceService**  
   Cryptographically fair rolls. Seeded for replay. Start here — everything depends on it.

2. **`@saga-keeper/ruleset-ironsworn` — moves + oracle tables**  
   Fill in the move catalogue, resolve logic, and all standard oracle tables.

3. **`@saga-keeper/storage` — LocalAdapter**  
   IndexedDB via Dexie.js. Campaigns, characters, session log, world entities.

4. **`@saga-keeper/services` — NarrativeDomain**  
   The full Skald turn loop (spec §8). Wires dice → moves → oracle → AI → storage.

5. **`@saga-keeper/ai-gateway` — ContextBuilder + AnthropicAdapter**  
   Context assembly and the first provider. Proxy endpoint needed server-side.

6. **`apps/web` — Iron Sheet screen**  
   Start with the most-used screen. Character state, meters, dice roller.

7. **`apps/web` — Skald screen**  
   Chat feed, streaming narration, inline oracle, move pills.

8. **`apps/web` — remaining screens**  
   Great Hall → Forge → Oracle → World Forge.
