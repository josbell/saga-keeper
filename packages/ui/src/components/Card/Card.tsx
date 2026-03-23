import type { ReactNode } from 'react'
import styles from './Card.module.css'

export interface CardProps {
  variant?: 'default' | 'hero'
  children: ReactNode
  className?: string
}

export function Card({ variant = 'default', children, className }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} data-variant={variant}>
      {children}
    </div>
  )
}
