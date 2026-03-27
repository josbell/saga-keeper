import type { ActivityDotColor } from '../../utils/sessionEventsToActivityItems'
import styles from './ActivityFeed.module.css'

export interface ActivityItem {
  id: string
  title: string
  meta: string
  dotColor: ActivityDotColor
}

export interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div role="log" aria-label="Recent activity" aria-live="polite" className={styles.feed}>
      {items.length === 0 ? (
        <p className={styles.empty}>No recent activity</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className={styles.item} data-activity-item>
            <span className={styles.dot} data-dot-color={item.dotColor} aria-hidden="true" />
            <div className={styles.body}>
              <p className={styles.title}>{item.title}</p>
              <p className={styles.meta}>{item.meta}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
