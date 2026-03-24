import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { StepProps, StatKey } from '../types'

const STAT_KEYS: StatKey[] = ['edge', 'heart', 'iron', 'shadow', 'wits']

export function ConfirmationStep({ draft, onNext }: StepProps) {
  const allAssets = ironswornPlugin.assets.getAll()
  const selectedAssets = allAssets.filter((a) => draft.assetIds.includes(a.id))

  return (
    <div className="confirmation-step">
      <section className="confirmation-step__section">
        <h3>{draft.name || '—'}</h3>
        <p>{draft.background || '—'}</p>
      </section>

      <section className="confirmation-step__section">
        <h4>Stats</h4>
        <div className="confirmation-step__stats">
          {STAT_KEYS.map((stat) => (
            <div key={stat} data-testid={`summary-${stat}`} className="confirmation-step__stat">
              <span>{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
              <span>{draft[stat]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="confirmation-step__section">
        <h4>Assets</h4>
        <ul>
          {selectedAssets.map((asset) => (
            <li key={asset.id}>{asset.name}</li>
          ))}
        </ul>
      </section>

      {draft.vow && (
        <section className="confirmation-step__section">
          <h4>Starting Vow</h4>
          <p>{draft.vow.title}</p>
          <p>{draft.vow.rank.charAt(0).toUpperCase() + draft.vow.rank.slice(1)}</p>
        </section>
      )}

      {draft.worldDescription && (
        <section className="confirmation-step__section">
          <h4>Your World</h4>
          <p>{draft.worldDescription}</p>
        </section>
      )}

      <button type="button" onClick={onNext} className="confirmation-step__commit">
        Begin your journey
      </button>
    </div>
  )
}
