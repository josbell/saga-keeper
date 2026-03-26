import type { SkaldMessage, TurnPhase } from '@/store/types'
import { MoveOutcomeCard, type MoveOutcomeData } from '../MoveOutcomeCard/MoveOutcomeCard'
import { OracleStrip } from '../OracleStrip/OracleStrip'
import styles from './SkaldFeed.module.css'

interface SkaldFeedProps {
  messages: SkaldMessage[]
  phase: TurnPhase
  streamBuffer: string
}

export function SkaldFeed({ messages, phase, streamBuffer }: SkaldFeedProps) {
  const isComposing = phase === 'waiting-for-ai' || phase === 'streaming' || phase === 'move-pending'
  const hasError = phase === 'error'

  return (
    <div className={styles.feed} role="log" aria-live="polite" aria-label="Story feed">
      {messages.map((msg) => (
        <div key={msg.id} className={styles.item} data-testid="feed-item">
          {msg.role === 'skald' && <SkaldBubble content={msg.content} />}
          {msg.role === 'player' && <PlayerBubble content={msg.content} />}
          {msg.role === 'system' && <SystemBubble content={msg.content} />}
          {msg.role === 'outcome' && <OutcomeItem content={msg.content} />}
          {msg.role === 'oracle' && <OracleItem content={msg.content} />}
        </div>
      ))}

      {phase === 'streaming' && streamBuffer !== '' && (
        <div className={styles.item} data-testid="feed-item">
          <SkaldBubble content={streamBuffer} partial data-testid="stream-bubble" />
        </div>
      )}

      {isComposing && (
        <div
          className={styles.typingIndicator}
          role="status"
          aria-label="The Skald is composing..."
        >
          <span className={styles.typingAvatar} aria-hidden="true">🪶</span>
          <div className={styles.typingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      )}

      {hasError && (
        <div className={styles.errorBanner} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          The Skald encountered an error. Please try again.
        </div>
      )}
    </div>
  )
}

interface BubbleProps {
  content: string
  partial?: boolean
  'data-testid'?: string
}

function SkaldBubble({ content, partial, 'data-testid': testId }: BubbleProps) {
  return (
    <div className={styles.skaldRow} data-testid={testId ?? 'skald-bubble'}>
      <span className={styles.skaldAvatar} aria-hidden="true" data-testid="skald-avatar">
        🪶
      </span>
      <div className={`${styles.skaldBubble} ${partial ? styles.partial : ''}`}>
        {content}
      </div>
    </div>
  )
}

function PlayerBubble({ content }: BubbleProps) {
  return (
    <div className={styles.playerRow} data-testid="player-bubble">
      <div className={styles.playerBubble}>{content}</div>
    </div>
  )
}

function SystemBubble({ content }: BubbleProps) {
  return (
    <div className={styles.systemBubble} data-testid="system-bubble">
      {content}
    </div>
  )
}

interface ContentProps {
  content: string
}

function OutcomeItem({ content }: ContentProps) {
  let data: MoveOutcomeData | null = null
  try {
    data = JSON.parse(content) as MoveOutcomeData
  } catch {
    return null
  }
  if (!data || typeof data.moveId !== 'string') return null
  return <MoveOutcomeCard {...data} />
}

function OracleItem({ content }: ContentProps) {
  let data: { tableId: string; roll: number; raw: string } | null = null
  try {
    data = JSON.parse(content) as { tableId: string; roll: number; raw: string }
  } catch {
    return null
  }
  if (!data || typeof data.tableId !== 'string') return null
  return <OracleStrip tableId={data.tableId} roll={data.roll} raw={data.raw} />
}
