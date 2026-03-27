import type { CharacterState, PlayerAction } from '@saga-keeper/domain'
import type { IronswornCharacterData, IronswornVow } from '@saga-keeper/ruleset-ironsworn'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { TurnPhase } from '@/store/types'
import styles from './SkaldRightPanel.module.css'

interface SkaldRightPanelProps {
  character: CharacterState | null
  pendingAction: PlayerAction | null
  phase: TurnPhase
}

export function SkaldRightPanel({ character, pendingAction, phase }: SkaldRightPanelProps) {
  const data = character ? (character.data as unknown as IronswornCharacterData) : null
  const vows: IronswornVow[] = data?.vows ?? []

  const activeMove =
    pendingAction?.type === 'move' && pendingAction.moveId
      ? ironswornPlugin.moves.getAll().find((m) => m.id === pendingAction.moveId) ?? null
      : null

  return (
    <>
      {/* Active Scene */}
      <section className={styles.section} aria-label="Active Scene">
        <h2 className={styles.sectionTitle}>Active Scene</h2>
        <div className={styles.sceneBlock}>
          <p className={styles.scenePlaceholder}>Awaiting scene context...</p>
        </div>
      </section>

      {/* Move Reference */}
      <section className={styles.section} aria-label="Move Reference">
        <h2 className={styles.sectionTitle}>Move Reference</h2>
        {activeMove ? (
          <div className={styles.moveRef}>
            <div className={styles.moveRefHead}>
              <span className={styles.moveRefName}>{activeMove.name}</span>
              <span className={styles.moveRefStat}>{activeMove.stats.join(' / ')}</span>
            </div>
            <p className={styles.moveRefDescription}>{activeMove.description}</p>
            <div className={styles.moveRefBody}>
              <div className={styles.moveOutcome}>
                <div className={`${styles.outcomeLabel} ${styles.strongHit}`}>Strong Hit</div>
              </div>
              <div className={styles.moveOutcome}>
                <div className={`${styles.outcomeLabel} ${styles.weakHit}`}>Weak Hit</div>
              </div>
              <div className={styles.moveOutcome}>
                <div className={`${styles.outcomeLabel} ${styles.miss}`}>Miss</div>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.emptyState}>No active move</p>
        )}
      </section>

      {/* Tracked Vows */}
      <section className={styles.section} aria-label="Tracked Vows">
        <h2 className={styles.sectionTitle}>Tracked Vows</h2>
        {vows.length === 0 ? (
          <p className={styles.emptyState}>No vows sworn</p>
        ) : (
          vows.map((vow) => <VowCard key={vow.id} vow={vow} />)
        )}
      </section>

      {/* Error / Warning */}
      {phase === 'error' && (
        <div className={styles.warningBlock} role="alert">
          <div className={styles.warningTitle}>Skald's Warning</div>
          <p className={styles.warningText}>Something went wrong. Please try again.</p>
        </div>
      )}
    </>
  )
}

interface VowCardProps {
  vow: IronswornVow
}

function VowCard({ vow }: VowCardProps) {
  return (
    <div className={styles.vowCard}>
      <p className={styles.vowTitle}>{vow.title}</p>
      <p className={styles.vowRank}>{vow.rank}</p>
      <div
        className={styles.vowProgress}
        role="progressbar"
        aria-label={`${vow.title} progress`}
        aria-valuenow={vow.progress}
        aria-valuemin={0}
        aria-valuemax={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`${styles.progressBox} ${i < vow.progress ? styles.filled : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
