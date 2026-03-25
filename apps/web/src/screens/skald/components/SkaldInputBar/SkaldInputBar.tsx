import { useState, type KeyboardEvent } from 'react'
import type { Move } from '@saga-keeper/domain'
import type { TurnPhase } from '@/store/types'
import styles from './SkaldInputBar.module.css'

interface SkaldInputBarProps {
  phase: TurnPhase
  moves: Move[]
  onSend: (text: string) => void
  onMoveSelect: (moveId: string) => void
  onOracleOpen: () => void
  isOracleOpen: boolean
  onMovesOpen: () => void
  isMovesOpen: boolean
}

export function SkaldInputBar({
  phase,
  moves,
  onSend,
  onMoveSelect,
  onOracleOpen,
  isOracleOpen,
  onMovesOpen,
  isMovesOpen,
}: SkaldInputBarProps) {
  const [text, setText] = useState('')

  const isBusy = phase === 'waiting-for-ai' || phase === 'streaming' || phase === 'move-pending'
  const canSend = text.trim().length > 0 && !isBusy

  function handleSend() {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.inputBar}>
      <ul className={styles.pillList} role="list" aria-label="Quick moves">
        {moves.map((move) => (
          <li key={move.id} role="listitem" className={styles.pillItem}>
            <button
              type="button"
              className={styles.pill}
              data-category={move.category}
              disabled={isBusy}
              onClick={() => onMoveSelect(move.id)}
            >
              {move.trigger}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          aria-label="Tell the Skald what you do"
          placeholder="What do you do..."
          value={text}
          disabled={isBusy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.movesBtn}
          aria-label="Open move browser"
          aria-haspopup="dialog"
          aria-expanded={isMovesOpen}
          aria-controls="skald-moves-popover"
          onClick={onMovesOpen}
        >
          ⚔
        </button>
        <button
          type="button"
          className={styles.oracleBtn}
          aria-label="Open oracle"
          aria-haspopup="dialog"
          aria-expanded={isOracleOpen}
          aria-controls="skald-oracle-popover"
          onClick={onOracleOpen}
        >
          ᛟ
        </button>
        <button
          type="button"
          className={styles.sendBtn}
          disabled={!canSend}
          onClick={handleSend}
        >
          Speak
        </button>
      </div>
    </div>
  )
}
