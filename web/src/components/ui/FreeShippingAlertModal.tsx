import { Truck, Sparkles, X, ArrowRight, ShoppingBag } from 'lucide-react'
import Dialog from './Dialog'
import { formatPrice } from '../../utils/cart'

interface FreeShippingAlertModalProps {
  open: boolean
  onClose: () => void
  amountNeeded: number
  currentSubtotal: number
  threshold: number
  shippingFee: number
  onAddMoreItems: () => void
  onProceedAnyway: () => void
}

export default function FreeShippingAlertModal({
  open,
  onClose,
  amountNeeded,
  currentSubtotal,
  threshold,
  shippingFee,
  onAddMoreItems,
  onProceedAnyway,
}: FreeShippingAlertModalProps) {
  const progress = Math.min(100, Math.max(0, (currentSubtotal / threshold) * 100))

  return (
    <Dialog open={open} onClose={onClose} titleId="shipping-alert-title">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/60 dark:to-teal-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                <h2 id="shipping-alert-title" className="font-heading font-black text-lg text-stone-900 dark:text-white">
                  ¡Cerca del Envío Gratis!
                </h2>
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 font-body">
                Meta de despacho sin costo: {formatPrice(threshold)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs text-stone-600 dark:text-zinc-300 font-body">
              Te faltan solo{' '}
              <strong className="text-emerald-700 dark:text-emerald-300 font-heading text-base font-black tabular-nums">
                {formatPrice(amountNeeded)}
              </strong>{' '}
              en productos para no pagar envío.
            </p>

            {/* Animated Progress Bar */}
            <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
              <span>Llevas {formatPrice(currentSubtotal)}</span>
              <span>{Math.round(progress)}% de la meta</span>
            </div>
          </div>

          <div className="text-xs text-stone-600 dark:text-zinc-300 space-y-1.5 bg-stone-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-stone-200 dark:border-zinc-700">
            <div className="flex justify-between">
              <span>Subtotal en canasta:</span>
              <span className="font-bold tabular-nums">{formatPrice(currentSubtotal)}</span>
            </div>
            <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
              <span>Costo de despacho actual:</span>
              <span className="tabular-nums">+{formatPrice(shippingFee)}</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 pt-1 border-t border-stone-200 dark:border-zinc-700">
              💡 Si agregas {formatPrice(amountNeeded)} más en frutas o verduras, te ahorras los {formatPrice(shippingFee)} del despacho.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 space-y-2">
          <button
            type="button"
            onClick={onAddMoreItems}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <ShoppingBag size={16} />
            <span>Agregar más productos y ahorrar {formatPrice(shippingFee)}</span>
          </button>

          <button
            type="button"
            onClick={onProceedAnyway}
            className="w-full py-2.5 px-4 rounded-xl text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white font-heading font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Continuar pagando despacho ({formatPrice(shippingFee)})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </Dialog>
  )
}
