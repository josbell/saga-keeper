import { useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { Move } from '@saga-keeper/domain'
import styles from './SkaldMovesPopover.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SkaldMovesPopoverProps {
  isOpen: boolean
  isBusy: boolean
  onClose: () => void
  onMoveSelect: (moveId: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ['adventure', 'combat', 'quest', 'relationship', 'fate'] as const
type Category = (typeof CATEGORY_ORDER)[number]

const CATEGORY_LABELS: Record<string, string> = {
  adventure: 'Adventure',
  combat: 'Combat',
  quest: 'Quest',
  relationship: 'Relationship',
  fate: 'Fate',
}

function groupByCategory(moves: Move[]): [Category, Move[]][] {
  const map = new Map<string, Move[]>()
  for (const move of moves) {
    const list = map.get(move.category) ?? []
    list.push(move)
    map.set(move.category, list)
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)!])
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SkaldMovesPopover({
  isOpen,
  isBusy,
  onClose,
  onMoveSelect,
}: SkaldMovesPopoverProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      closeRef.current?.focus()
    } else {
      prevFocusRef.current?.focus()
      prevFocusRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  const groups = groupByCategory(ironswornPlugin.moves.getAll())

  function handleMoveClick(moveId: string) {
    onMoveSelect(moveId)
    onClose()
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
      if (first === last) return
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
      id="skald-moves-popover"
      className={styles.popover}
      role="dialog"
      aria-modal="true"
      aria-label="Move Browser"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        <span className={styles.title}>Moves</span>
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          aria-label="Close move browser"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {groups.map(([category, moves]) => (
          <section key={category} aria-label={CATEGORY_LABELS[category]}>
            <h3 className={styles.categoryHeading}>{CATEGORY_LABELS[category]}</h3>
            <ul className={styles.moveList}>
              {moves.map((move) => (
                <li key={move.id}>
                  <button
                    type="button"
                    className={styles.moveBtn}
                    data-category={category}
                    disabled={isBusy}
                    onClick={() => handleMoveClick(move.id)}
                  >
                    <span className={styles.moveName}>{move.name}</span>
                    <span className={styles.moveStats}>{move.stats.join(' / ')}</span>
                    <span className={styles.moveTrigger}>{move.trigger}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>,
    document.body,
  )
}
