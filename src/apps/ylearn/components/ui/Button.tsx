import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'
}

const variantClass: Record<NonNullable<Props['variant']>, string> = {
  primary: 'yl-btn-primary',
  secondary: 'yl-btn-secondary',
  danger: 'yl-btn-danger',
  ghost: 'yl-btn-ghost',
  accent: 'yl-btn-accent',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      className={`yl-btn ${variantClass[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
