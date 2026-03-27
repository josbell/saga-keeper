import type { CampaignSummary } from '@saga-keeper/domain'
import { formatRelativeDate } from '../../utils/formatRelativeDate'
import styles from './CampaignCard.module.css'

interface CampaignCardCharacter {
  name: string
  health: number
  spirit: number
  momentum: number
}

interface CampaignCardVow {
  title: string
  progress: number
}

export interface CampaignCardProps {
  campaign: CampaignSummary
  character: CampaignCardCharacter | null
  leadingVow: CampaignCardVow | null
  onContinue: () => void
  onDetails: () => void
}

function statusLabel(campaign: CampaignSummary): string {
  const base =
    campaign.status === 'active'
      ? 'Active'
      : campaign.status === 'complete'
        ? 'Saga Complete'
        : 'Abandoned'
  const isCoOp = campaign.mode === 'coop-same-pc' || campaign.mode === 'coop-remote'
  return isCoOp && campaign.status === 'active' ? `${base} · Co-op` : base
}

export function CampaignCard({ campaign, character, leadingVow, onContinue, onDetails }: CampaignCardProps) {
  const isActive = campaign.status === 'active'
  const isComplete = campaign.status === 'complete'

  return (
    <article className={styles.card} data-status={campaign.status}>
      <div className={styles.inner}>
        <div className={styles.statusRow}>
          <span className={styles.statusBadge} data-status={campaign.status}>
            {statusLabel(campaign)}
          </span>
          {campaign.lastPlayedAt && (
            <span className={styles.lastPlayed}>{formatRelativeDate(campaign.lastPlayedAt)}</span>
          )}
        </div>

        <h2 className={styles.name}>{campaign.name}</h2>

        {campaign.tagline && (
          <p className={styles.tagline} data-tagline>
            {campaign.tagline}
          </p>
        )}

        {character && (
          <div className={styles.character} data-character>
            <span className={styles.charName}>{character.name}</span>
            <div className={styles.meters}>
              <meter
                className={styles.meter}
                aria-label="Health"
                value={character.health}
                min={0}
                max={5}
                aria-valuenow={character.health}
                aria-valuemin={0}
                aria-valuemax={5}
              />
              <meter
                className={styles.meter}
                aria-label="Spirit"
                value={character.spirit}
                min={0}
                max={5}
                aria-valuenow={character.spirit}
                aria-valuemin={0}
                aria-valuemax={5}
              />
              <meter
                className={styles.meter}
                aria-label="Momentum"
                value={character.momentum}
                min={-6}
                max={10}
                aria-valuenow={character.momentum}
                aria-valuemin={-6}
                aria-valuemax={10}
              />
            </div>
          </div>
        )}

        {leadingVow && (
          <div className={styles.vow} data-vow>
            <p className={styles.vowTitle}>{leadingVow.title}</p>
            <div className={styles.pips} role="img" aria-label={`Vow progress: ${leadingVow.progress} of 10`}>
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={styles.pip}
                  data-pip={i < leadingVow.progress ? 'filled' : 'empty'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {isActive && (
          <button type="button" className={styles.continueBtn} onClick={onContinue}>
            Continue Saga
          </button>
        )}
        {isComplete && (
          <button type="button" className={styles.viewBtn} onClick={onDetails}>
            View Chronicle
          </button>
        )}
        {!isComplete && (
          <button type="button" className={styles.detailsBtn} onClick={onDetails}>
            Details
          </button>
        )}
      </div>
    </article>
  )
}
