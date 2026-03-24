import { useState } from 'react'
import { ironswornPlugin } from '@saga-keeper/ruleset-ironsworn'
import type { CreationStep } from '@saga-keeper/domain'
import { INITIAL_DRAFT, type ForgeDraft, type StepProps } from './types'
import { WorldSelectStep } from './steps/WorldSelectStep'
import { NameBackgroundStep } from './steps/NameBackgroundStep'
import { StatAssignmentStep } from './steps/StatAssignmentStep'
import { AssetPickerStep } from './steps/AssetPickerStep'

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
      return <div data-testid="step-vow-composer" />
    case 'confirmation':
      return <div data-testid="step-confirmation" />
    default:
      return null
  }
}

export function ForgeScreen() {
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<ForgeDraft>(INITIAL_DRAFT)

  const steps = ironswornPlugin.creation.steps
  const totalSteps = steps.length
  const step = steps[Math.min(stepIndex, totalSteps - 1)]!

  function handleDraftChange(patch: Partial<ForgeDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function handleNext() {
    if (stepIndex < totalSteps - 1) {
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
