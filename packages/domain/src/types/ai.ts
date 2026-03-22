// ── AI Gateway domain types ───────────────────────────────────────────────────

import type { CharacterSnapshot } from './character'
import type { WorldSnapshot } from './world'
import type { SessionEvent } from './session'
import type { OracleRoll } from './oracle'

export type AITier = 'offline' | 'assisted' | 'full-skald'

export type NarrativeTone = 'grim' | 'heroic' | 'mythic'

export type AIIntent =
  | 'skald.narrate'
  | 'skald.move'
  | 'oracle.narrate'
  | 'oracle.extract'
  | 'world.generate'
  | 'world.expand'
  | 'forge.counsel'
  | 'hall.reminder'

export interface GameContext {
  rulesetId: string
  characters: CharacterSnapshot[]
  world: WorldSnapshot
  /** Last N turns, trimmed to token budget */
  recentEvents: SessionEvent[]
  oracleHistory: OracleRoll[]
  narrativeTone?: NarrativeTone
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CompletionOptions {
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface CompletionRequest {
  intent: AIIntent
  context: GameContext
  userMessage?: string
  history?: Message[]
  options?: CompletionOptions
}

export interface CompletionResponse {
  text: string
  intent: AIIntent
  tokensUsed: number
}

export interface StreamChunk {
  delta: string
  done: boolean
}

export interface ProviderCapabilities {
  streaming: boolean
  maxContextTokens: number
  supportsSystemPrompt: boolean
  /** true for local models (Ollama) — disables remote co-op */
  localOnly: boolean
}

export interface AIGateway {
  complete(request: CompletionRequest): Promise<CompletionResponse>
  stream(request: CompletionRequest): AsyncIterable<StreamChunk>
  getCapabilities(): ProviderCapabilities
  getTier(): AITier
}

export interface ProviderAdapter {
  id: string
  displayName: string
  complete(systemPrompt: string, messages: Message[], options: CompletionOptions): Promise<string>
  stream(
    systemPrompt: string,
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<string>
  getCapabilities(): ProviderCapabilities
}
