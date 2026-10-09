import React from 'react'
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const fmtCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16">
      <span className="w-6 h-6 rounded-full border-2 border-mora border-t-transparent animate-spin" />
      {label && <span className="text-sand/60 text-sm">{label}</span>}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
      {message}
    </div>
  )
}

export function SuccessBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <div role="status" className="rounded-xl bg-[#1E5631]/40 border border-mora/40 text-[#A5D6A7] text-sm px-4 py-3">
      {message}
    </div>
  )
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-[#111111] border border-white/10 rounded-2xl shadow-2xl w-full ${
          wide ? 'max-w-4xl' : 'max-w-lg'
        } max-h-[88vh] overflow-y-auto`}
      >
        <div className="sticky top-0 bg-[#111111] flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-heading font-black text-sand text-lg uppercase tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

const baseField =
  'w-full px-3 py-2.5 rounded-xl bg-white/10 text-sand placeholder:text-sand/40 text-sm border border-white/10 focus:border-mora focus:outline-none transition-colors'

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-xs font-heading font-bold uppercase tracking-wide text-sand/60 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseField} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseField} ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${baseField} ${props.className ?? ''}`}>
      {props.children}
    </select>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 py-1"
    >
      <span
        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
          checked ? 'bg-mora' : 'bg-white/15'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
      <span className="text-sm text-sand/70">{label}</span>
    </button>
  )
}

export function ActionButton({
  children,
  onClick,
  variant = 'ghost',
  disabled,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'ghost' | 'danger' | 'primary' | 'success'
  disabled?: boolean
  title?: string
}) {
  const styles: Record<string, string> = {
    ghost: 'border-white/10 text-sand/70 hover:text-sand hover:bg-white/10',
    danger: 'border-white/10 text-red-300 hover:bg-red-500/10 hover:border-red-500/40',
    primary: 'bg-mora text-white hover:bg-mora-dark border-transparent',
    success: 'bg-[#25D366] text-charcoal hover:bg-[#1FBD5C] border-transparent',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold border transition-colors disabled:opacity-50 ${
        styles[variant]
      }`}
    >
      {children}
    </button>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    CONFIRMED: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    DELIVERED: 'bg-mora/20 text-[#A5D6A7] border-mora/40',
    CANCELLED: 'bg-red-500/15 text-red-300 border-red-500/30',
  }
  const label: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border ${
        map[status] ?? 'bg-white/10 text-sand border-white/20'
      }`}
    >
      {label[status] ?? status}
    </span>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-14 text-sand/40 text-sm">{message}</div>
  )
}
