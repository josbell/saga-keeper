import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { useSkaldTurn } from './hooks/useSkaldTurn'
import { SkaldFeed } from './components/SkaldFeed/SkaldFeed'
import { SkaldInputBar } from './components/SkaldInputBar/SkaldInputBar'
import { SkaldLeftSidebar } from './components/SkaldLeftSidebar/SkaldLeftSidebar'
import { SkaldRightPanel } from './components/SkaldRightPanel/SkaldRightPanel'
import { SkaldOraclePopover } from './components/SkaldOraclePopover/SkaldOraclePopover'
import { SkaldMovesPopover } from './components/SkaldMovesPopover/SkaldMovesPopover'
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
  const [isMovesOpen, setIsMovesOpen] = useState(false)

  // skaldFeedSlice
  const messages = useGameStore((s) => s.messages)
  const phase = useGameStore((s) => s.phase)
  const streamBuffer = useGameStore((s) => s.streamBuffer)

  // characterSlice
  const character = useGameStore((s) => s.character)

  // sessionSlice
  const pendingAction = useGameStore((s) => s.pendingAction)
  const campaignId = useGameStore((s) => s.campaign?.id ?? '')

  const { submitAction } = useSkaldTurn({
    campaignId,
    ...(character?.id ? { characterId: character.id } : {}),
  })

  const suggestedMoves = character
    ? ironswornPlugin.moves.suggest({
        characterState: character,
        inCombat: false,
        onJourney: false,
        recentMoves: [],
      })
    : ironswornPlugin.moves.getByCategory('adventure').slice(0, 5)

  function handleSend(text: string) {
    if (!campaignId) return
    void submitAction({ type: 'free', ...(character?.id ? { characterId: character.id } : {}), userText: text })
  }

  function handleMoveSelect(moveId: string) {
    if (!campaignId) return
    const move = ironswornPlugin.moves.getAll().find((m) => m.id === moveId)
    if (!move) return
    void submitAction({
      type: 'move',
      moveId,
      ...(character?.id ? { characterId: character.id } : {}),
      statKey: move.stats[0] ?? 'edge',
    })
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
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
          <div className={styles.inputArea}>
            <SkaldInputBar
              phase={phase}
              moves={suggestedMoves}
              onSend={handleSend}
              onMoveSelect={handleMoveSelect}
              onOracleOpen={() => setIsOracleOpen((prev) => !prev)}
              isOracleOpen={isOracleOpen}
              onMovesOpen={() => setIsMovesOpen((prev) => !prev)}
              isMovesOpen={isMovesOpen}
            />
            <SkaldMovesPopover
              isOpen={isMovesOpen}
              isBusy={phase === 'resolving' || phase === 'waiting-for-ai' || phase === 'streaming'}
              onClose={() => setIsMovesOpen(false)}
              onMoveSelect={handleMoveSelect}
            />
            <SkaldOraclePopover isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} />
          </div>
        </main>

        <aside className={styles.rightPanel} aria-label="Scene & Moves">
          <SkaldRightPanel
            character={character}
            pendingAction={pendingAction}
            phase={phase}
          />
        </aside>
      </div>
    </div>
  )
}
