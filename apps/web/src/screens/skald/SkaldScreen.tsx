import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { SkaldFeed } from './components/SkaldFeed/SkaldFeed'
import { SkaldInputBar } from './components/SkaldInputBar/SkaldInputBar'
import { SkaldLeftSidebar } from './components/SkaldLeftSidebar/SkaldLeftSidebar'
import styles from './SkaldScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: '/skald' },
  { label: 'World Forge', path: null },
]

export function SkaldScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isOracleOpen, setIsOracleOpen] = useState(false)

  // skaldFeedSlice
  const messages = useGameStore((s) => s.messages)
  const phase = useGameStore((s) => s.phase)
  const streamBuffer = useGameStore((s) => s.streamBuffer)
  const appendMessage = useGameStore((s) => s.appendMessage)

  // characterSlice
  const character = useGameStore((s) => s.character)

  const suggestedMoves = character
    ? ironswornPlugin.moves.suggest({
        characterState: character,
        inCombat: false,
        onJourney: false,
        recentMoves: [],
      })
    : ironswornPlugin.moves.getByCategory('adventure').slice(0, 5)

  function handleSend(text: string) {
    appendMessage({
      id: globalThis.crypto.randomUUID(),
      role: 'player',
      content: text,
      timestamp: new Date().toISOString(),
    })
  }

  function handleMoveSelect(moveId: string) {
    const move = ironswornPlugin.moves.getAll().find((m) => m.id === moveId)
    if (move) {
      appendMessage({
        id: globalThis.crypto.randomUUID(),
        role: 'player',
        content: `[${move.name}] ${move.trigger}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header} role="banner">
        <div className={styles.headerLogo}>
          <span className={styles.logoTitle}>Saga Keeper</span>
        </div>
        <nav className={styles.headerNav} aria-label="Application">
          {NAV_ITEMS.map(({ label, path }) => (
            <button
              key={label}
              type="button"
              className={styles.navBtn}
              aria-current={path === pathname ? 'page' : undefined}
              disabled={path === null}
              onClick={path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.body}>
        <aside className={styles.leftSidebar} aria-label="Character & Sessions">
          <SkaldLeftSidebar character={character} />
        </aside>

        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>The Skald</h1>
          <SkaldFeed messages={messages} phase={phase} streamBuffer={streamBuffer} />
          <SkaldInputBar
            phase={phase}
            moves={suggestedMoves}
            onSend={handleSend}
            onMoveSelect={handleMoveSelect}
            onOracleOpen={() => setIsOracleOpen((prev) => !prev)}
            isOracleOpen={isOracleOpen}
          />
          {/* SkaldOraclePopover — chunk 6 */}
        </main>

        <aside className={styles.rightPanel} aria-label="Scene & Moves">
          {/* SkaldRightPanel — chunk 5 */}
        </aside>
      </div>
    </div>
  )
}
