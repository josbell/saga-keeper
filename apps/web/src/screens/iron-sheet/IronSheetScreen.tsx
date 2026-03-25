import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import { useGameStore } from '@/store'
import { CharacterHeader } from './components/CharacterHeader/CharacterHeader'
import { StatsGrid } from './components/StatsGrid/StatsGrid'
import type { StatKey } from './components/StatsGrid/StatsGrid'
import { ConditionMeters } from './components/ConditionMeters/ConditionMeters'
import { DebilityChips } from './components/DebilityChips/DebilityChips'
import type { DebilityKey } from './components/DebilityChips/DebilityChips'
import { VowTracker } from './components/VowTracker/VowTracker'
import { DiceRollerSection } from './components/DiceRollerSection/DiceRollerSection'
import styles from './IronSheetScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: '/skald' },
  { label: 'World Forge', path: null },
]

export function IronSheetScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const character = useGameStore((state) => state.character)
  const patchCharacterData = useGameStore((state) => state.patchCharacterData)
  const [selectedStat, setSelectedStat] = useState<StatKey | null>(null)

  function handleStatSelect(stat: StatKey) {
    setSelectedStat((prev) => (prev === stat ? null : stat))
  }

  if (!character) {
    return (
      <div className={styles.screen}>
        {renderHeader(navigate, pathname)}
        <main className={styles.empty} role="main" tabIndex={-1}>
          <p>No character loaded</p>
        </main>
      </div>
    )
  }

  const data = character.data as unknown as IronswornCharacterData
  const loadedCharacter = character

  function handleDebilityToggle(key: DebilityKey) {
    const { next } = ironswornPlugin.character.applyCondition(
      loadedCharacter,
      key,
      !data.debilities[key]
    )
    patchCharacterData(next.data as Record<string, unknown>)
  }

  function handleVowProgressChange(vowId: string, progress: number) {
    patchCharacterData({
      vows: data.vows.map((v) => (v.id === vowId ? { ...v, progress } : v)),
    })
  }

  const leadingVow = data.vows.find((v) => !v.fulfilled) ?? null

  return (
    <div className={styles.screen}>
      {renderHeader(navigate, pathname)}
      <div className={styles.body}>
        <aside className={styles.sidebar}>{/* Session nav placeholder */}</aside>
        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>Iron Sheet</h1>
          <CharacterHeader
            name={character.name}
            {...(character.epithet ? { epithet: character.epithet } : {})}
            {...(character.portraitUrl ? { portraitUrl: character.portraitUrl } : {})}
            {...(leadingVow ? { leadingVowTitle: leadingVow.title } : {})}
            experienceEarned={data.experience.earned}
            experienceSpent={data.experience.spent}
          />
          <StatsGrid
            edge={data.edge}
            heart={data.heart}
            iron={data.iron}
            shadow={data.shadow}
            wits={data.wits}
            selectedStat={selectedStat}
            onStatSelect={handleStatSelect}
          />
          <ConditionMeters
            health={data.health}
            spirit={data.spirit}
            supply={data.supply}
            momentum={data.momentum}
            onHealthChange={(v) => patchCharacterData({ health: v })}
            onSpiritChange={(v) => patchCharacterData({ spirit: v })}
            onSupplyChange={(v) => patchCharacterData({ supply: v })}
            onMomentumChange={(v) => patchCharacterData({ momentum: v })}
          />
          <DebilityChips debilities={data.debilities} onToggle={handleDebilityToggle} />
          <VowTracker vows={data.vows} onProgressChange={handleVowProgressChange} />
          <DiceRollerSection
            selectedStat={selectedStat}
            statValue={selectedStat ? data[selectedStat] : null}
          />
        </main>
      </div>
    </div>
  )
}

function renderHeader(navigate: ReturnType<typeof useNavigate>, currentPath: string) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLogo}>
        <span className={styles.logoTitle}>Saga Keeper</span>
      </div>
      <nav className={styles.headerNav} aria-label="Application">
        {NAV_ITEMS.map(({ label, path }) => (
          <button
            key={label}
            type="button"
            className={styles.navBtn}
            aria-current={path === currentPath ? 'page' : undefined}
            disabled={path === null}
            onClick={path ? () => navigate(path) : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
