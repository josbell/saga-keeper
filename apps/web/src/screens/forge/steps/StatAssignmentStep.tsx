import { useState, useRef } from 'react'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps, StatKey } from '../types'
import styles from './StatAssignmentStep.module.css'

const STAT_KEYS: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

const STAT_META: Record<StatKey, { rune: string; desc: string }> = {
  edge: { rune: 'ᛖ', desc: 'Speed & ranged' },
  heart: { rune: 'ᚺ', desc: 'Courage & bonds' },
  iron: { rune: 'ᛁ', desc: 'Strength & combat' },
  shadow: { rune: 'ᛊ', desc: 'Deception & stealth' },
  wits: { rune: 'ᚹ', desc: 'Cunning & survival' },
}

type DragSource = { kind: 'pool'; value: number } | { kind: 'stat'; key: StatKey; value: number }

const DRAG_TYPE = 'application/x-forge-stat'

function computePool(draft: StepProps['draft']): number[] {
  const budget = [...ironswornPlugin.creation.statBudget]
  const assignedValues = STAT_KEYS.map((k) => draft[k]).filter((v) => v > 0)
  const pool = [...budget]
  for (const val of assignedValues) {
    const idx = pool.indexOf(val)
    if (idx !== -1) pool.splice(idx, 1)
  }
  return pool
}

export function StatAssignmentStep({ draft, onDraftChange }: StepProps) {
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<StatKey | 'pool' | null>(null)
  const poolRef = useRef<HTMLDivElement>(null)

  const pool = computePool(draft)

  function handlePoolKeyDown(e: React.KeyboardEvent, idx: number) {
    const buttons = poolRef.current ? Array.from(poolRef.current.querySelectorAll('button')) : []
    if (e.key === 'ArrowRight' && idx < buttons.length - 1) {
      e.preventDefault()
      ;(buttons[idx + 1] as HTMLElement).focus()
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      ;(buttons[idx - 1] as HTMLElement).focus()
    }
  }

  // ── Click-to-assign ──────────────────────────────────────────────────────
  function handleTokenClick(value: number) {
    setSelectedToken((prev) => (prev === value ? null : value))
  }

  function handleStatClick(stat: StatKey) {
    if (selectedToken !== null) {
      onDraftChange({ [stat]: selectedToken })
      setSelectedToken(null)
    } else if (draft[stat] > 0) {
      onDraftChange({ [stat]: 0 })
    }
  }

  // ── Drag and drop ────────────────────────────────────────────────────────
  function startDrag(e: React.DragEvent, source: DragSource) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(source))
    setSelectedToken(null)
  }

  function handleStatDrop(e: React.DragEvent, targetStat: StatKey) {
    e.preventDefault()
    setDragOverTarget(null)
    const raw = e.dataTransfer.getData(DRAG_TYPE)
    if (!raw) return
    const source = JSON.parse(raw) as DragSource

    if (source.kind === 'pool') {
      onDraftChange({ [targetStat]: source.value })
    } else {
      // swap: move source value to target, move target value (or 0) back to source
      onDraftChange({ [source.key]: draft[targetStat], [targetStat]: source.value })
    }
  }

  function handlePoolDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOverTarget(null)
    const raw = e.dataTransfer.getData(DRAG_TYPE)
    if (!raw) return
    const source = JSON.parse(raw) as DragSource
    if (source.kind === 'stat') {
      onDraftChange({ [source.key]: 0 })
    }
  }

  return (
    <div className={styles.step}>
      {/* Value chip pool */}
      <div>
        <div className={styles.sectionHeading}>Available Values</div>
        <div
          ref={poolRef}
          data-testid="budget-pool"
          className={`${styles.pool}${dragOverTarget === 'pool' ? ' ' + styles.dragOver : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverTarget('pool')
          }}
          onDragLeave={() => setDragOverTarget(null)}
          onDrop={handlePoolDrop}
        >
          <span className={styles.poolLabel}>Pool</span>
          {pool.map((value, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.chip}
              aria-pressed={selectedToken === value}
              tabIndex={idx === 0 ? 0 : -1}
              draggable
              onClick={() => handleTokenClick(value)}
              onKeyDown={(e) => handlePoolKeyDown(e, idx)}
              onDragStart={(e) => startDrag(e, { kind: 'pool', value })}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Stat grid */}
      <div>
        <div className={styles.sectionHeading}>Attributes</div>
        <div className={styles.statGrid}>
          {STAT_KEYS.map((stat) => {
            const { rune, desc } = STAT_META[stat]
            const isAssigned = draft[stat] > 0
            const isDragOver = dragOverTarget === stat
            return (
              <div
                key={stat}
                data-testid={`stat-${stat}`}
                className={[
                  styles.statSlot,
                  isAssigned ? styles.assigned : '',
                  isDragOver ? styles.dragOver : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleStatClick(stat)}
                role="button"
                tabIndex={0}
                draggable={isAssigned}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleStatClick(stat)
                }}
                onDragStart={(e) => startDrag(e, { kind: 'stat', key: stat, value: draft[stat] })}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverTarget(stat)
                }}
                onDragLeave={() => setDragOverTarget(null)}
                onDrop={(e) => handleStatDrop(e, stat)}
              >
                <div className={styles.statRune}>{rune}</div>
                <div className={styles.statName}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                {isAssigned ? (
                  <div className={styles.statValue}>{draft[stat]}</div>
                ) : (
                  <div className={styles.statEmpty}>—</div>
                )}
                <div className={styles.statDesc}>{desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
