import { useNavigate } from 'react-router-dom'
import styles from './OracleScreen.module.css'

const NAV_ITEMS = [
  { label: 'Iron Sheet', path: '/iron-sheet' },
  { label: 'Oracle', path: null },
  { label: 'Skald', path: null },
  { label: 'World Forge', path: null },
]

export function OracleScreen() {
  const navigate = useNavigate()

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
              aria-current={path === null ? 'page' : undefined}
              onClick={path ? () => navigate(path) : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Oracle Tables" />
        <main className={styles.main} role="main" tabIndex={-1}>
          <h1 className={styles.pageTitle}>Oracle</h1>
        </main>
        <aside className={styles.rightPanel} aria-label="Recent Revelations" />
      </div>
    </div>
  )
}
