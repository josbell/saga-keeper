import { useState } from 'react'
import type { OracleTable } from '@saga-keeper/domain'
import styles from './OracleTableBrowser.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  location: 'Location',
  settlement: 'Settlement',
  npc: 'NPC',
  combat: 'Combat',
  fate: 'Fate',
  creature: 'Creature',
}

export interface OracleTableBrowserProps {
  tables: OracleTable[]
  selectedTableId: string | null
  onSelect: (tableId: string) => void
}

export function OracleTableBrowser({ tables, selectedTableId, onSelect }: OracleTableBrowserProps) {
  const categories = [...new Set(tables.map((t) => t.category))]
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggleCategory(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  if (tables.length === 0) {
    return <nav className={styles.nav} aria-label="Oracle Tables" />
  }

  return (
    <nav className={styles.nav} aria-label="Oracle Tables">
      {categories.map((category) => {
        const isExpanded = !collapsed.has(category)
        const listId = `oracle-group-${category}`
        const label = CATEGORY_LABELS[category] ?? category

        return (
          <div key={category} className={styles.group}>
            <button
              type="button"
              className={styles.groupHeader}
              aria-expanded={isExpanded}
              aria-controls={listId}
              onClick={() => toggleCategory(category)}
            >
              <span className={styles.groupLabel}>{label}</span>
              <span className={styles.groupChevron} aria-hidden="true">
                {isExpanded ? '▾' : '▸'}
              </span>
            </button>
            <ul id={listId} className={styles.tableList} hidden={!isExpanded}>
              {tables
                .filter((t) => t.category === category)
                .map((table) => (
                  <li key={table.id} className={styles.tableItem}>
                    <button
                      type="button"
                      className={styles.tableBtn}
                      aria-pressed={selectedTableId === table.id}
                      onClick={() => onSelect(table.id)}
                    >
                      {table.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
