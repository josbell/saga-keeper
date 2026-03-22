// TemplateRegistry — resolves rulesetId → IPromptTemplate

import type { AIIntent } from '@saga-keeper/domain'
import type { IPromptTemplate } from './PromptTemplate'

export interface ITemplateRegistry {
  resolve(rulesetId: string, intent: AIIntent): IPromptTemplate
  register(rulesetId: string, template: IPromptTemplate): void
}

// No-op fallback: returns an empty string for unknown rulesets (graceful degradation)
const FALLBACK_TEMPLATE: IPromptTemplate = {
  render: () => '',
}

export class TemplateRegistry implements ITemplateRegistry {
  private readonly templates = new Map<string, IPromptTemplate>()

  constructor(entries?: Array<{ rulesetId: string; template: IPromptTemplate }>) {
    for (const { rulesetId, template } of entries ?? []) {
      this.register(rulesetId, template)
    }
  }

  register(rulesetId: string, template: IPromptTemplate): void {
    this.templates.set(rulesetId, template)
  }

  /**
   * Returns the template registered for `rulesetId`. The `intent` parameter is
   * accepted for interface compatibility but is intentionally unused here —
   * intent-specific branching is delegated to `IPromptTemplate.render()`.
   * If intent-level template selection is ever needed, change the Map key to
   * a compound `${rulesetId}:${intent}` with a two-level fallback.
   */
  resolve(rulesetId: string, _intent: AIIntent): IPromptTemplate {
    return this.templates.get(rulesetId) ?? FALLBACK_TEMPLATE
  }
}
