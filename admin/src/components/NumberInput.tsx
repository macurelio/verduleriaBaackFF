import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Minus, Plus, Check, Loader2 } from 'lucide-react'
import type { Product } from '../api/types'

// ─── Primitive Stepper Subcomponents (Chakra-style modular API) ────────────────

export interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function NumberDecrementStepper({
  onClick,
  disabled,
  title = 'Disminuir valor',
}: {
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-sand/70 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      <Minus size={15} />
    </button>
  )
}

export function NumberIncrementStepper({
  onClick,
  disabled,
  title = 'Aumentar valor',
}: {
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-sand/70 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      <Plus size={15} />
    </button>
  )
}

export function NumberInputStepper({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

export function NumberInputField({
  value,
  onChange,
  onBlur,
  onKeyDown,
  prefix,
  suffix,
  disabled,
  className = '',
  ariaLabel,
}: {
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  prefix?: string
  suffix?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}) {
  return (
    <div className="flex items-center flex-1 min-w-0 px-2">
      {prefix && (
        <span className="text-sand/50 text-sm font-heading font-bold select-none mr-1">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`w-full bg-transparent font-heading font-black text-sand text-base text-center focus:outline-none placeholder:text-sand/30 disabled:opacity-50 ${className}`}
      />
      {suffix && (
        <span className="text-sand/50 text-xs font-normal select-none ml-1 whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── NumberInput (Form / Modal Stepper) ─────────────────────────────────────────

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 100,
  prefix = '$',
  suffix,
  disabled = false,
  className = '',
  ariaLabel = 'Valor numérico',
}: NumberInputProps) {
  const [internalVal, setInternalVal] = useState<string>(String(value))

  useEffect(() => {
    setInternalVal(String(value))
  }, [value])

  const commitValue = (num: number) => {
    let next = num
    if (min !== undefined && next < min) next = min
    if (max !== undefined && next > max) next = max
    setInternalVal(String(next))
    onChange(next)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setInternalVal(raw)
  }

  const handleBlur = () => {
    const parsed = parseInt(internalVal, 10)
    if (isNaN(parsed)) {
      commitValue(min)
    } else {
      commitValue(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      increment()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decrement()
    }
  }

  const increment = () => {
    const current = parseInt(internalVal, 10) || 0
    commitValue(current + step)
  }

  const decrement = () => {
    const current = parseInt(internalVal, 10) || 0
    commitValue(current - step)
  }

  const currentNum = parseInt(internalVal, 10) || 0
  const canDecrement = !disabled && (min === undefined || currentNum > min)
  const canIncrement = !disabled && (max === undefined || currentNum < max)

  return (
    <div
      className={`flex items-center justify-between rounded-xl bg-white/10 border border-white/10 px-1 py-1 focus-within:border-mora focus-within:ring-2 focus-within:ring-mora/30 transition-all ${className}`}
    >
      <NumberDecrementStepper onClick={decrement} disabled={!canDecrement} />
      <NumberInputField
        value={internalVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        prefix={prefix}
        suffix={suffix}
        disabled={disabled}
        ariaLabel={ariaLabel}
      />
      <NumberIncrementStepper onClick={increment} disabled={!canIncrement} />
    </div>
  )
}

// ─── PriceStepper (Inline Card / List Stepper with Auto-Save Feedback) ─────────

export interface PriceStepperProps {
  product: Product
  onPriceChange: (product: Product, newPrice: number) => Promise<void>
  step?: number
  min?: number
  disabled?: boolean
  compact?: boolean
}

export function PriceStepper({
  product,
  onPriceChange,
  step = 100,
  min = 100,
  disabled = false,
  compact = false,
}: PriceStepperProps) {
  const [price, setPrice] = useState<number>(product.price)
  const [displayVal, setDisplayVal] = useState<string>(String(product.price))
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [hasError, setHasError] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedPrice = useRef<number>(product.price)

  // Sync if external product prop changes
  useEffect(() => {
    setPrice(product.price)
    setDisplayVal(String(product.price))
    lastSavedPrice.current = product.price
  }, [product.price])

  const triggerSave = useCallback(
    async (targetPrice: number) => {
      if (targetPrice === lastSavedPrice.current) return
      setSaving(true)
      setHasError(false)
      try {
        await onPriceChange(product, targetPrice)
        lastSavedPrice.current = targetPrice
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 1500)
      } catch {
        setHasError(true)
        // Revert to last confirmed saved price
        setPrice(lastSavedPrice.current)
        setDisplayVal(String(lastSavedPrice.current))
        setTimeout(() => setHasError(false), 2500)
      } finally {
        setSaving(false)
      }
    },
    [product, onPriceChange],
  )

  const scheduleSave = (targetPrice: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      triggerSave(targetPrice)
    }, 450)
  }

  const handleStep = (delta: number) => {
    if (disabled || saving) return
    const next = Math.max(min, price + delta)
    setPrice(next)
    setDisplayVal(String(next))
    scheduleSave(next)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^\d]/g, '')
    setDisplayVal(clean)
  }

  const handleBlur = () => {
    const parsed = parseInt(displayVal, 10)
    const validPrice = isNaN(parsed) || parsed < min ? min : parsed
    setPrice(validPrice)
    setDisplayVal(String(validPrice))
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    triggerSave(validPrice)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleStep(step)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleStep(-step)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className={`inline-flex items-center rounded-xl border transition-all ${
          hasError
            ? 'bg-red-500/10 border-red-500/40 text-red-300'
            : savedSuccess
              ? 'bg-[#1E5631]/40 border-mora text-[#A5D6A7]'
              : 'bg-white/5 border-white/10 hover:border-white/20 focus-within:border-mora focus-within:ring-2 focus-within:ring-mora/20'
        } ${compact ? 'p-0.5' : 'p-1'}`}
      >
        <button
          type="button"
          onClick={() => handleStep(-step)}
          disabled={disabled || saving || price <= min}
          title={`Disminuir precio (-$${step.toLocaleString('es-CL')})`}
          aria-label={`Disminuir precio de ${product.name}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sand/70 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Minus size={13} />
        </button>

        <div className="flex items-center px-1">
          <span className="text-sand/50 text-xs font-heading font-black select-none mr-0.5">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={`Precio en CLP de ${product.name}`}
            className="w-14 sm:w-16 text-center bg-transparent font-heading font-black text-sand text-sm sm:text-base focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => handleStep(step)}
          disabled={disabled || saving}
          title={`Aumentar precio (+$${step.toLocaleString('es-CL')})`}
          aria-label={`Aumentar precio de ${product.name}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sand/70 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      <span className="text-xs text-sand/60 font-normal">/ {product.unit}</span>

      {/* Visual save indicators */}
      {saving && (
        <span className="inline-flex items-center text-xs text-sand/50 gap-1 animate-pulse" title="Guardando precio…">
          <Loader2 size={13} className="animate-spin text-mora" />
        </span>
      )}
      {savedSuccess && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-heading font-bold text-[#A5D6A7] bg-mora/20 px-1.5 py-0.5 rounded-md"
          title="Precio actualizado en el servidor"
        >
          <Check size={12} /> Guardado
        </span>
      )}
      {hasError && (
        <span className="text-[11px] font-heading font-bold text-red-300" title="Error al actualizar precio">
          Error
        </span>
      )}
    </div>
  )
}
