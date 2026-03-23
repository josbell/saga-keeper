// @saga-keeper/ui
// Shared design system — tokens, components, typography.
// No business logic. No domain dependencies.
export * from './tokens/colors'
export * from './tokens/typography'

// Components
export { Button } from './components/Button/Button'
export type { ButtonProps } from './components/Button/Button'

export { Input } from './components/Input/Input'
export type { InputProps } from './components/Input/Input'

export { Textarea } from './components/Textarea/Textarea'
export type { TextareaProps } from './components/Textarea/Textarea'

export { Card } from './components/Card/Card'
export type { CardProps } from './components/Card/Card'

export { Badge } from './components/Badge/Badge'
export type { BadgeProps } from './components/Badge/Badge'

export { StatTrack } from './components/StatTrack/StatTrack'
export type { StatTrackProps } from './components/StatTrack/StatTrack'

export { DiceRoller } from './components/DiceRoller/DiceRoller'
export type { DiceRollerProps } from './components/DiceRoller/DiceRoller'
export type { DiceResult, DiceOutcome } from './components/DiceRoller/rollDice'
