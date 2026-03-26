/**
 * Returns a human-readable relative date string for an ISO timestamp.
 * "Today" | "Yesterday" | "N days ago" | "N weeks ago"
 */
export function formatRelativeDate(iso: string | undefined): string {
  if (!iso) return ''
  const now = new Date()
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  const weeks = Math.floor(diffDays / 7)
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`
}
