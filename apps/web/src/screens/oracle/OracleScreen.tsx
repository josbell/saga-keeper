import { useNavigate } from 'react-router-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { OracleTableBrowser } from './components/OracleTableBrowser/OracleTableBrowser'
import { AskFatesPanel } from './components/AskFatesPanel/AskFatesPanel'
import styles from './OracleScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: null },
  { label: 'Skald', path: null },
  { label: 'World Forge', path: null },
]

export function OracleScreen() {
  const navigate = useNavigate()
  const tables = ironswornPlugin.oracle.getTables()
  const draft = useGameStore((state) => state.draft)
  const lastFates = useGameStore((state) => state.lastFates)
  const setDraft = useGameStore((state) => state.setDraft)
  const recordFates = useGameStore((state) => state.recordFates)

  const selectedTable = tables.find((t) => t.id === draft.tableId) ?? null

  function handleFatesRoll() {
    if (!draft.odds) return
    const result = ironswornPlugin.oracle.rollAskFates(draft.odds)
    recordFates(result)
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
              aria-current={path === null ? 'page' : undefined}
              onClick={path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Oracle Tables">
          <OracleTableBrowser
            tables={tables}
            selectedTableId={draft.tableId}
            onSelect={(tableId) => setDraft({ tableId, odds: null })}
          />
        </aside>
        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>Oracle</h1>
          {selectedTable === null && (
            <AskFatesPanel
              selectedOdds={draft.odds}
              lastFates={lastFates}
              onOddsSelect={(odds) => setDraft({ odds })}
              onRoll={handleFatesRoll}
            />
          )}
        </main>
        <aside className={styles.rightPanel} aria-label="Recent Revelations" />
      </div>
    </div>
  )
}
