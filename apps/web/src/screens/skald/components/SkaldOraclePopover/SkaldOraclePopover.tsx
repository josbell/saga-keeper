import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { AskFatesPanel } from '../../../oracle/components/AskFatesPanel/AskFatesPanel'
import { OracleTableBrowser } from '../../../oracle/components/OracleTableBrowser/OracleTableBrowser'
import { OracleTableRollPanel } from '../../../oracle/components/OracleTableRollPanel/OracleTableRollPanel'
import type { OracleRoll, FatesResult } from '@saga-keeper/domain'
import styles from './SkaldOraclePopover.module.css'

type Tab = 'ask-fates' | 'browse-tables' | 'recent'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ask-fates', label: 'Ask Fates' },
  { id: 'browse-tables', label: 'Browse Tables' },
  { id: 'recent', label: 'Recent' },
]

interface SkaldOraclePopoverProps {
  isOpen: boolean
  onClose: () => void
}

export function SkaldOraclePopover({ isOpen, onClose }: SkaldOraclePopoverProps) {
  const [activeTab, setActiveTab] = useState<Tab>('ask-fates')
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstTabRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  // oracle store
  const tables = ironswornPlugin.oracle.getTables()
  const draft = useGameStore((s) => s.draft)
  const lastFates = useGameStore((s) => s.lastFates)
  const lastResult = useGameStore((s) => s.lastResult)
  const history = useGameStore((s) => s.history)
  const fatesHistory = useGameStore((s) => s.fatesHistory)
  const setDraft = useGameStore((s) => s.setDraft)
  const recordFates = useGameStore((s) => s.recordFates)
  const recordOracleRoll = useGameStore((s) => s.recordOracleRoll)
  const clearHistory = useGameStore((s) => s.clearHistory)

  // Save previous focus, move focus in, and return it on close
  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      firstTabRef.current?.focus()
    } else {
      prevFocusRef.current?.focus()
      prevFocusRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedTable = tables.find((t) => t.id === draft.tableId) ?? null

  function handleFatesRoll() {
    if (!draft.odds) return
    recordFates(ironswornPlugin.oracle.rollAskFates(draft.odds))
  }

  function handleTableRoll() {
    if (!draft.tableId) return
    recordOracleRoll(ironswornPlugin.oracle.roll(draft.tableId))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }

  return createPortal(
    <div
      ref={dialogRef}
      id="skald-oracle-popover"
      className={styles.popover}
      role="dialog"
      aria-modal="true"
      aria-label="Oracle"
      onKeyDown={handleKeyDown}
    >
      {/* Tab strip */}
      <div className={styles.tabList} role="tablist" aria-label="Oracle sections">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            ref={idx === 0 ? firstTabRef : undefined}
            type="button"
            role="tab"
            id={`oracle-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`oracle-panel-${tab.id}`}
            className={styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <button type="button" className={styles.closeBtn} aria-label="Close oracle" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Tab panel */}
      <div
        className={styles.tabPanel}
        role="tabpanel"
        id={`oracle-panel-${activeTab}`}
        aria-labelledby={`oracle-tab-${activeTab}`}
      >
        {activeTab === 'ask-fates' && (
          <AskFatesPanel
            selectedOdds={draft.odds}
            lastFates={lastFates}
            onOddsSelect={(odds) => setDraft({ odds })}
            onRoll={handleFatesRoll}
          />
        )}

        {activeTab === 'browse-tables' && (
          <div className={styles.browseLayout}>
            <OracleTableBrowser
              tables={tables}
              selectedTableId={draft.tableId}
              onSelect={(tableId) => setDraft({ tableId, odds: null })}
            />
            {selectedTable && (
              <OracleTableRollPanel
                table={selectedTable}
                lastResult={lastResult?.tableId === selectedTable.id ? lastResult : null}
                onRoll={handleTableRoll}
              />
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <RecentTab
            history={history}
            fatesHistory={fatesHistory}
            tables={tables.reduce<Record<string, string>>((acc, t) => {
              acc[t.id] = t.name
              return acc
            }, {})}
            onClear={clearHistory}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

interface RecentTabProps {
  history: OracleRoll[]
  fatesHistory: FatesResult[]
  tables: Record<string, string>
  onClear: () => void
}

function RecentTab({ history, fatesHistory, tables, onClear }: RecentTabProps) {
  const combined = [
    ...history.map((r) => ({ kind: 'roll' as const, data: r })),
    ...fatesHistory.map((f) => ({ kind: 'fates' as const, data: f })),
  ].sort((a, b) => b.data.timestamp.localeCompare(a.data.timestamp))

  if (combined.length === 0) {
    return (
      <div className={styles.recentEmpty}>
        <p>No revelations yet</p>
      </div>
    )
  }

  return (
    <div className={styles.recent}>
      <button type="button" className={styles.clearBtn} aria-label="Clear Oracle History" onClick={onClear}>
        Clear
      </button>
      <ul className={styles.recentList}>
        {combined.map((entry) => (
          <li key={`${entry.kind}-${entry.data.timestamp}`} className={styles.recentItem}>
            {entry.kind === 'fates' ? (
              <span className={entry.data.result ? styles.yes : styles.no}>
                {entry.data.result ? 'Yes' : 'No'}
                {entry.data.extreme && ' (Extreme)'}
              </span>
            ) : (
              <span className={styles.rollResult}>{entry.data.raw}</span>
            )}
            <span className={styles.recentMeta}>
              {entry.kind === 'fates'
                ? entry.data.odds
                : tables[entry.data.tableId] ?? entry.data.tableId}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
