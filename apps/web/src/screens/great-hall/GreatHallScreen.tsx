import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { CampaignSummary } from '@saga-keeper/domain'
import type { IronswornCharacterData, IronswornVow } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { useCampaignOps } from '@/providers/NarrativeDomainProvider'
import { HeroSection } from './components/HeroSection/HeroSection'
import { StatsBar } from './components/StatsBar/StatsBar'
import { CampaignCard } from './components/CampaignCard/CampaignCard'
import { ActivityFeed } from './components/ActivityFeed/ActivityFeed'
import { SkaldReminderCard } from './components/SkaldReminderCard/SkaldReminderCard'
import { sessionEventsToActivityItems } from './utils/sessionEventsToActivityItems'
import { deriveReminderText } from './utils/deriveReminderText'
import styles from './GreatHallScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: '/skald' },
  { label: 'World Forge', path: null },
]

export function GreatHallScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { listCampaigns, loadCampaign } = useCampaignOps()

  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])

  const character = useGameStore((s) => s.character)
  const events = useGameStore((s) => s.events)
  const setCampaign = useGameStore((s) => s.setCampaign)
  const setCharacter = useGameStore((s) => s.setCharacter)
  const appendEvent = useGameStore((s) => s.appendEvent)
  const clearSession = useGameStore((s) => s.clearSession)

  useEffect(() => {
    listCampaigns().then(setCampaigns).catch(() => {})
  }, [listCampaigns])

  async function handleContinue(campaignId: string) {
    const { campaign, character: loadedChar, events: loadedEvents } = await loadCampaign(campaignId)
    clearSession()
    setCampaign(campaign)
    setCharacter(loadedChar)
    for (const event of loadedEvents) {
      appendEvent(event)
    }
    navigate('/skald')
  }

  // Derived data
  const data = character ? (character.data as unknown as IronswornCharacterData) : null
  const leadingVow: IronswornVow | null = data?.vows?.find((v) => !v.fulfilled) ?? data?.vows?.[0] ?? null

  const activityItems = sessionEventsToActivityItems(
    events,
    campaigns[0]?.name ?? '',
  )

  const firstCampaign = campaigns[0]
  const reminderText = deriveReminderText(
    firstCampaign ? { id: firstCampaign.id, name: firstCampaign.name, rulesetId: firstCampaign.rulesetId, status: firstCampaign.status, mode: firstCampaign.mode, characterIds: firstCampaign.characterIds, createdAt: '', updatedAt: '' } : null,
    character,
  )

  const totalCharacters = campaigns.reduce((n, c) => n + c.characterIds.length, 0)

  return (
    <div className={styles.screen}>
      <header className={styles.header} role="banner">
        <button
          type="button"
          className={styles.logoBtn}
          aria-label="Go to Great Hall"
          aria-current={pathname === '/great-hall' ? 'page' : undefined}
          onClick={() => navigate('/great-hall')}
        >
          <span className={styles.logoTitle}>Saga Keeper</span>
        </button>
        <nav className={styles.headerNav} aria-label="Application">
          {NAV_ITEMS.map(({ label, path }) => (
            <button
              key={label}
              type="button"
              className={styles.navBtn}
              aria-current={path === pathname ? 'page' : undefined}
              disabled={path === null}
              onClick={path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <HeroSection />

      <StatsBar
        campaigns={campaigns.length}
        characters={totalCharacters}
        vowsSworn={0}
        vowsFulfilled={0}
        sessionsPlayed={0}
      />

      <main className={styles.main} role="main" tabIndex={-1}>
        <div className={styles.body}>
          <section className={styles.campCol} role="region" aria-label="Campaigns">
            <div className={styles.campGrid}>
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  character={
                    character && campaigns.find((camp) => camp.characterIds.includes(character.id))?.id === c.id
                      ? {
                          name: character.name,
                          health: data?.health ?? 5,
                          spirit: data?.spirit ?? 5,
                          momentum: data?.momentum ?? 2,
                        }
                      : null
                  }
                  leadingVow={
                    leadingVow
                      ? { title: leadingVow.title, progress: leadingVow.progress }
                      : null
                  }
                  onContinue={() => handleContinue(c.id)}
                  onDetails={() => {}}
                />
              ))}
              <NewCampaignCard onForge={() => navigate('/forge')} />
            </div>
          </section>

          <div className={styles.rightCol}>
            <ActivityFeed items={activityItems} />
            <SkaldReminderCard reminderText={reminderText} />
          </div>
        </div>
      </main>
    </div>
  )
}

// ── New Campaign Card (inline — single use, no logic) ─────────────────────────

interface NewCampaignCardProps {
  onForge: () => void
}

function NewCampaignCard({ onForge }: NewCampaignCardProps) {
  return (
    <div className={styles.newCampCard}>
      <span className={styles.newCampIcon} aria-hidden="true">+</span>
      <p className={styles.newCampLabel}>Forge New Campaign</p>
      <p className={styles.newCampSub}>
        Begin a new saga. Name your world, create your character, and swear your first iron vow.
      </p>
      <button type="button" className={styles.newCampBtn} onClick={onForge} aria-label="Enter the Forge">
        Enter the Forge
      </button>
    </div>
  )
}
