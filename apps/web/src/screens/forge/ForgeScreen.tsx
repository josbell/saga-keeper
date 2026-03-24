import { useState } from 'react'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import type { AIGateway, CharacterState, CreationStep } from '@saga-keeper/domain'
import { useGameStore } from '@/store'
import { INITIAL_DRAFT, type ForgeDraft, type StepProps } from './types'
import { useForgeCounsel } from './hooks/useForgeCounsel'
import { WorldSelectStep } from './steps/WorldSelectStep'
import { NameBackgroundStep } from './steps/NameBackgroundStep'
import { StatAssignmentStep } from './steps/StatAssignmentStep'
import { AssetPickerStep } from './steps/AssetPickerStep'
import { VowComposerStep } from './steps/VowComposerStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import styles from './ForgeScreen.module.css'

// Stub gateway used when no real AI provider is configured.
// Returns an empty string so no message is appended to the feed.
const STUB_GATEWAY: AIGateway = {
  complete: () => Promise.resolve({ text: '', intent: 'forge.counsel', tokensUsed: 0 }),
  stream: async function* () {},
  getCapabilities: () => ({
    streaming: false,
    maxContextTokens: 0,
    supportsSystemPrompt: false,
    localOnly: true,
  }),
  getTier: () => 'offline',
}

const STEP_SIDEBAR_LABELS: Record<string, string> = {
  'world-select': 'Name Your World',
  'name-background': 'Name & Background',
  'stat-assignment': 'Assign Stats',
  'asset-picker': 'Choose Assets',
  'vow-composer': 'Swear Your Vow',
  confirmation: 'Enter the World',
}

const STEP_SUBTITLES: Record<string, string> = {
  'world-select': 'Describe the Ironlands you inhabit — its people, its perils, and its truths.',
  'name-background': 'Who are you, wanderer? What drives you into the perilous Ironlands?',
  'stat-assignment': 'Distribute your attributes across five core stats.',
  'asset-picker': 'Choose three starting assets — paths, companions, or rituals.',
  'vow-composer': 'Every saga begins with an iron oath. What do you swear to achieve?',
  confirmation: 'Your character is ready. Review and begin your saga.',
}

function getStepSub(stepId: string, draft: ForgeDraft, isDone: boolean): string {
  if (!isDone) return ''
  switch (stepId) {
    case 'world-select':
      return draft.worldDescription ? draft.worldDescription.slice(0, 28) + '…' : ''
    case 'name-background':
      return draft.name || ''
    case 'stat-assignment': {
      const total = draft.edge + draft.heart + draft.iron + draft.shadow + draft.wits
      return total > 0 ? `${total} pts assigned` : ''
    }
    case 'asset-picker':
      return draft.assetIds.length > 0 ? `${draft.assetIds.length} / 3` : ''
    case 'vow-composer':
      return draft.vow?.title ?? ''
    default:
      return ''
  }
}

function renderStep(step: CreationStep, props: StepProps) {
  switch (step.component) {
    case 'world-select':
      return <WorldSelectStep {...props} />
    case 'name-background':
      return <NameBackgroundStep {...props} />
    case 'stat-assignment':
      return <StatAssignmentStep {...props} />
    case 'asset-picker':
      return <AssetPickerStep {...props} />
    case 'vow-composer':
      return <VowComposerStep {...props} />
    case 'confirmation':
      return <ConfirmationStep {...props} />
    default:
      return null
  }
}

export function ForgeScreen({ gateway = STUB_GATEWAY }: { gateway?: AIGateway } = {}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<ForgeDraft>(INITIAL_DRAFT)

  const steps = ironswornPlugin.creation.steps
  const totalSteps = steps.length
  const step = steps[Math.min(stepIndex, totalSteps - 1)]!

  useForgeCounsel(gateway, step, draft)

  function handleDraftChange(patch: Partial<ForgeDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function handleConfirm() {
    const now = new Date().toISOString()
    const defaults = ironswornPlugin.character.defaults() as unknown as IronswornCharacterData
    const data: IronswornCharacterData = {
      ...defaults,
      edge: draft.edge || defaults.edge,
      heart: draft.heart || defaults.heart,
      iron: draft.iron || defaults.iron,
      shadow: draft.shadow || defaults.shadow,
      wits: draft.wits || defaults.wits,
      assetIds: draft.assetIds,
      vows: draft.vow ? [draft.vow] : [],
    }
    const character: CharacterState = {
      id: globalThis.crypto.randomUUID(),
      campaignId: 'default',
      name: draft.name,
      rulesetId: 'ironsworn-v1',
      data: data as unknown as Record<string, unknown>,
      createdAt: now,
      updatedAt: now,
    }
    useGameStore.getState().setCharacter(character)
  }

  function handleNext() {
    if (stepIndex === totalSteps - 1) {
      handleConfirm()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
    }
  }

  const stepProps: StepProps = {
    draft,
    onDraftChange: handleDraftChange,
    onNext: handleNext,
    onBack: handleBack,
    stepIndex,
    totalSteps,
  }

  return (
    <div className={styles.screen}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <span className={styles.logoTitle}>Saga Keeper</span>
          <span className={styles.logoSub}>The Forge</span>
        </div>
        <button type="button" className={styles.exitBtn}>
          ← Exit
        </button>
      </header>

      {/* Body */}
      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Creation Ritual</div>

          {steps.map((s, idx) => {
            const status = idx < stepIndex ? 'done' : idx === stepIndex ? 'current' : 'locked'
            const isDone = status === 'done'
            return (
              <div key={s.id}>
                {idx > 0 && <div className={styles.connector} />}
                <div className={`${styles.stepItem} ${styles[status]}`}>
                  <div className={`${styles.stepBadge} ${styles[status]}`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepName}>{STEP_SIDEBAR_LABELS[s.id] ?? s.title}</div>
                    <div className={styles.stepSub}>{getStepSub(s.id, draft, isDone)}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Character preview */}
          <div className={styles.preview}>
            <div className={styles.previewLabel}>Character</div>
            {draft.name ? (
              <div className={styles.previewName}>{draft.name}</div>
            ) : (
              <div className={styles.previewEmpty}>Unnamed wanderer</div>
            )}
          </div>
        </aside>

        {/* Main area */}
        <main className={styles.main}>
          <div className={styles.breadcrumb}>Character Creation</div>
          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.subtitle}>{STEP_SUBTITLES[step.id] ?? ''}</p>

          <div className={styles.content}>{renderStep(step, stepProps)}</div>

          <footer className={styles.footer}>
            {stepIndex > 0 ? (
              <button type="button" className={styles.prevBtn} onClick={handleBack}>
                Back
              </button>
            ) : (
              <span />
            )}
            <span className={styles.stepIndicator}>
              {stepIndex + 1} / {totalSteps}
            </span>
            {stepIndex < totalSteps - 1 && (
              <button type="button" className={styles.nextBtn} onClick={handleNext}>
                Next
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  )
}
