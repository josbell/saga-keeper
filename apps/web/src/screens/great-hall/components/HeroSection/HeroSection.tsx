import styles from './HeroSection.module.css'

export function HeroSection() {
  return (
    <div className={styles.hero}>
      <span className={styles.rune} aria-hidden="true">ᚺ</span>
      <div className={styles.inner}>
        <p className={styles.greeting}>Welcome back, Skald</p>
        <h1 className={styles.headline}>The Great Hall</h1>
        <p className={styles.tagline}>
          Your sagas endure here. Choose a campaign to continue your oath — or forge a new one from blood and iron.
        </p>
      </div>
    </div>
  )
}
