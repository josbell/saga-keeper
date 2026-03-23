import styles from './Input.module.css'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return <input className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
}
