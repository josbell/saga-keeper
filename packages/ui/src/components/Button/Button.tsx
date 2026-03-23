import styles from './Button.module.css'

export interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
