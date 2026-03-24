import { useState } from 'react'
import { ironswornPlugin, type IronswornCharacterData } from '@saga-keeper/ruleset-ironsworn'
import type { AIGateway, CharacterState, CreationStep } from '@saga-keeper/domain'
import { useGameStore } from '@/store'
import { INITIAL_DRAFT, type ForgeDraft, type StepProps } from './types'
import { useForgeCounsel } from './hooks/useForgeCounsel'

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
import { WorldSelectStep } from './steps/WorldSelectStep'
import { NameBackgroundStep } from './steps/NameBackgroundStep'
import { StatAssignmentStep } from './steps/StatAssignmentStep'
import { AssetPickerStep } from './steps/AssetPickerStep'
import { VowComposerStep } from './steps/VowComposerStep'
import { ConfirmationStep } from './steps/ConfirmationStep'

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
    <div className="forge-screen">
      <div className="forge-screen__header">
        <h2>{step.title}</h2>
        <span className="forge-screen__progress">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="forge-screen__step">{renderStep(step, stepProps)}</div>

      <div className="forge-screen__nav">
        {stepIndex > 0 && (
          <button type="button" onClick={handleBack}>
            Back
          </button>
        )}
        {stepIndex < totalSteps - 1 && (
          <button type="button" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}
