import { useRef } from 'react'
import { Input } from '@saga-keeper/ui'
import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps } from '../types'
import styles from './VowComposerStep.module.css'

const VOW_RANKS: IronswornVow['rank'][] = [
  'troublesome',
  'dangerous',
  'formidable',
  'extreme',
  'epic',
]

function buildVow(
  existing: IronswornVow | null,
  patch: Partial<Pick<IronswornVow, 'title' | 'rank'>>
): IronswornVow {
  return {
    id: existing?.id ?? globalThis.crypto.randomUUID(),
    title: existing?.title ?? '',
    rank: existing?.rank ?? 'dangerous',
    progress: 0,
    fulfilled: false,
    ...patch,
  }
}

export function VowComposerStep({ draft, onDraftChange }: StepProps) {
  const ranksRef = useRef<HTMLDivElement>(null)

  function handleTitleChange(title: string) {
    onDraftChange({ vow: buildVow(draft.vow, { title }) })
  }

  function handleRankSelect(rank: IronswornVow['rank']) {
    onDraftChange({ vow: buildVow(draft.vow, { rank }) })
  }

  function handleRankKeyDown(e: React.KeyboardEvent, idx: number) {
    const buttons = ranksRef.current
      ? Array.from(ranksRef.current.querySelectorAll<HTMLElement>('button'))
      : []
    if (e.key === 'ArrowRight' && idx < buttons.length - 1) {
      e.preventDefault()
      buttons[idx + 1]?.focus()
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      buttons[idx - 1]?.focus()
    }
  }

  const selectedRankIdx = draft.vow ? VOW_RANKS.indexOf(draft.vow.rank) : -1

  return (
    <div className={styles.step}>
      <div className={styles.vowWrap}>
        <div className={styles.vowLabel}>Your Iron Oath</div>
        <Input
          value={draft.vow?.title ?? ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your vow"
        />
      </div>

      <div className={styles.rankSection}>
        <div className={styles.rankLabel}>Rank</div>
        <div ref={ranksRef} className={styles.ranks} role="group" aria-label="Vow rank">
          {VOW_RANKS.map((rank, idx) => (
            <button
              key={rank}
              type="button"
              aria-pressed={draft.vow?.rank === rank}
              tabIndex={idx === (selectedRankIdx >= 0 ? selectedRankIdx : 0) ? 0 : -1}
              onClick={() => handleRankSelect(rank)}
              onKeyDown={(e) => handleRankKeyDown(e, idx)}
              className={styles.rankBtn}
            >
              {rank.charAt(0).toUpperCase() + rank.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
