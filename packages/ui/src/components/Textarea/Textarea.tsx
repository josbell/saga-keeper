import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={[styles.textarea, className].filter(Boolean).join(' ')} {...props} />
}
