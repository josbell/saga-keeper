import { Input } from '@saga-keeper/ui'
import type { IronswornVow } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps } from '../types'

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
    <div className="vow-composer-step">
      <div className="vow-composer-step__field">
        <Input
          value={draft.vow?.title ?? ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your vow"
        />
      </div>
      <div className="vow-composer-step__ranks">
        {VOW_RANKS.map((rank) => (
          <button
            key={rank}
            type="button"
            aria-pressed={draft.vow?.rank === rank}
            onClick={() => handleRankSelect(rank)}
            className="vow-composer-step__rank-btn"
          >
            {rank.charAt(0).toUpperCase() + rank.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
