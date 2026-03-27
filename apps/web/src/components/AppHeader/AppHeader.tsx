import { useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store'
import styles from './AppHeader.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: '/skald' },
  { label: 'World Forge', path: null },
]

export function AppHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const campaign = useGameStore((state) => state.campaign)

  return (
    <header className={styles.header} role="banner">
      <button
        type="button"
        className={styles.logoBtn}
        aria-label="Go to Great Hall"
        aria-current={pathname === '/great-hall' ? 'page' : undefined}
        onClick={() => navigate('/great-hall')}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <polygon points="17,2 32,32 2,32" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6" />
          <line x1="17" y1="2" x2="17" y2="32" stroke="#d4941a" strokeWidth="0.8" />
          <line x1="10" y1="16" x2="24" y2="16" stroke="#d4941a" strokeWidth="0.8" opacity="0.7" />
          <circle cx="17" cy="17" r="2.5" fill="#f0b429" opacity="0.7" />
        </svg>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Saga Keeper</span>
          <span className={styles.logoSub}>Ironsworn Companion</span>
        </div>
      </button>
      <nav className={styles.nav} aria-label="Application">
        {NAV_ITEMS.map(({ label, path }) => {
          const enabled = path === '/iron-sheet' ? campaign != null : path !== null
          return (
            <button
              key={label}
              type="button"
              className={styles.navBtn}
              aria-current={path === pathname ? 'page' : undefined}
              disabled={!enabled}
              onClick={enabled && path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
