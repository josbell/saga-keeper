import { useNavigate, useLocation } from 'react-router-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { OracleTableBrowser } from './components/OracleTableBrowser/OracleTableBrowser'
import { AskFatesPanel } from './components/AskFatesPanel/AskFatesPanel'
import { OracleTableRollPanel } from './components/OracleTableRollPanel/OracleTableRollPanel'
import { OracleHistory } from './components/OracleHistory/OracleHistory'
import styles from './OracleScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: null },
  { label: 'World Forge', path: null },
]

export function OracleScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tables = ironswornPlugin.oracle.getTables()
  const draft = useGameStore((state) => state.draft)
  const lastFates = useGameStore((state) => state.lastFates)
  const lastResult = useGameStore((state) => state.lastResult)
  const history = useGameStore((state) => state.history)
  const fatesHistory = useGameStore((state) => state.fatesHistory)
  const setDraft = useGameStore((state) => state.setDraft)
  const recordFates = useGameStore((state) => state.recordFates)
  const recordOracleRoll = useGameStore((state) => state.recordOracleRoll)
  const clearHistory = useGameStore((state) => state.clearHistory)

  const selectedTable = tables.find((t) => t.id === draft.tableId) ?? null

  function handleFatesRoll() {
    if (!draft.odds) return
    const result = ironswornPlugin.oracle.rollAskFates(draft.odds)
    recordFates(result)
  }

  function handleTableRoll() {
    if (!draft.tableId) return
    const result = ironswornPlugin.oracle.roll(draft.tableId)
    recordOracleRoll(result)
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
        <aside className={styles.sidebar} aria-label="Oracle Tables">
          <OracleTableBrowser
            tables={tables}
            selectedTableId={draft.tableId}
            onSelect={(tableId) => setDraft({ tableId, odds: null })}
          />
        </aside>
        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>Oracle</h1>
          {selectedTable === null ? (
            <AskFatesPanel
              selectedOdds={draft.odds}
              lastFates={lastFates}
              onOddsSelect={(odds) => setDraft({ odds })}
              onRoll={handleFatesRoll}
            />
          ) : (
            <OracleTableRollPanel
              table={selectedTable}
              lastResult={lastResult?.tableId === selectedTable.id ? lastResult : null}
              onRoll={handleTableRoll}
            />
          )}
        </main>
        <OracleHistory
          history={history}
          fatesHistory={fatesHistory}
          tables={tables}
          onClearHistory={clearHistory}
          className={styles.rightPanel}
        />
      </div>
    </div>
  )
}
