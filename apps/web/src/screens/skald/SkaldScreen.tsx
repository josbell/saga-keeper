import { useNavigate, useLocation } from 'react-router-dom'
import styles from './SkaldScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: '/oracle' },
  { label: 'Skald', path: '/skald' },
  { label: 'World Forge', path: null },
]

export function SkaldScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.screen}>
      <header className={styles.header} role="banner">
        <div className={styles.headerLogo}>
          <span className={styles.logoTitle}>Saga Keeper</span>
        </div>
        <nav className={styles.headerNav} aria-label="Application">
          {NAV_ITEMS.map(({ label, path }) => (
            <button
              key={label}
              type="button"
              className={styles.navBtn}
              aria-current={path === pathname ? 'page' : undefined}
              disabled={path === null}
              onClick={path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.body}>
        <aside className={styles.leftSidebar} aria-label="Character & Sessions">
          {/* SkaldLeftSidebar — chunk 4 */}
        </aside>

        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>The Skald</h1>
          {/* SkaldFeed — chunk 2 */}
          {/* SkaldInputBar — chunk 3 */}
        </main>

        <aside className={styles.rightPanel} aria-label="Scene & Moves">
          {/* SkaldRightPanel — chunk 5 */}
        </aside>
      </div>
    </div>
  )
}
