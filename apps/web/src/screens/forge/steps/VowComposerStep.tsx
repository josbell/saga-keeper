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
  function handleTitleChange(title: string) {
    onDraftChange({ vow: buildVow(draft.vow, { title }) })
  }

  function handleRankSelect(rank: IronswornVow['rank']) {
    onDraftChange({ vow: buildVow(draft.vow, { rank }) })
  }

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
        <div className={styles.ranks}>
          {VOW_RANKS.map((rank) => (
            <button
              key={rank}
              type="button"
              aria-pressed={draft.vow?.rank === rank}
              onClick={() => handleRankSelect(rank)}
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
