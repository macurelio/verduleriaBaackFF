import type { ButtonProps, ButtonVariant, ButtonSize } from '../../types'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-mora text-white hover:bg-mora-dark active:bg-mora-dark/90 shadow-md hover:shadow-lg',
  secondary:
    'bg-mora-light text-charcoal hover:bg-cream-warm active:bg-cream-border shadow-md hover:shadow-lg',
  outline:
    'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white',
  ghost: 'text-charcoal hover:bg-cream-warm active:bg-cream-border',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1da851] active:bg-[#189a4a] shadow-md hover:shadow-lg',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  ...props
}: ButtonProps) {
  return (
    <Tag
      className={[
        'inline-flex items-center justify-center font-heading font-bold rounded-xl',
        'transition-all duration-200 ease-out cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mora focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
