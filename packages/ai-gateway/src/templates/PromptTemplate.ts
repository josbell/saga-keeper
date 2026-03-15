// PromptTemplate — versioned templates by rulesetId + AIIntent — TODO: implement
import type { AIIntent, GameContext } from '@saga-keeper/domain'
export interface IPromptTemplate {
  render(rulesetId: string, intent: AIIntent, context: GameContext): string
}
