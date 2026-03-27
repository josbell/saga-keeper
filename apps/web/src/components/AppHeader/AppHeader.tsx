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
        <span className={styles.logoTitle}>Saga Keeper</span>
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
