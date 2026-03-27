import type {
  AIGateway,
  AITier,
  CompletionRequest,
  CompletionResponse,
  ProviderCapabilities,
  StreamChunk,
} from '@saga-keeper/domain'

/**
 * Stub AIGateway for the offline tier.
 *
 * NarrativeDomain checks getTier() === 'offline' and skips the AI call entirely,
 * so complete() and stream() must never be called in normal operation.
 * They throw to surface any accidental invocation during development.
 */
export class OfflineAIGateway implements AIGateway {
  getTier(): AITier {
    return 'offline'
  }

  getCapabilities(): ProviderCapabilities {
    return {
      streaming: false,
      maxContextTokens: 0,
      supportsSystemPrompt: false,
      localOnly: true,
    }
  }

  complete(_request: CompletionRequest): Promise<CompletionResponse> {
    throw new Error('OfflineAIGateway.complete() must never be called in the offline tier')
  }

  // eslint-disable-next-line require-yield
  async *stream(_request: CompletionRequest): AsyncGenerator<StreamChunk> {
    throw new Error('OfflineAIGateway.stream() must never be called in the offline tier')
  }
}
