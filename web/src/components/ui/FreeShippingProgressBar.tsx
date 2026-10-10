import { Truck, CheckCircle2 } from 'lucide-react'

interface FreeShippingProgressBarProps {
  currentSubtotal: number
  threshold?: number
  className?: string
}

export default function FreeShippingProgressBar({
  currentSubtotal,
  threshold = 20000,
  className = '',
}: FreeShippingProgressBarProps) {
  const remaining = Math.max(0, threshold - currentSubtotal)
  const progress = Math.min(100, Math.max(0, (currentSubtotal / threshold) * 100))
  const isFree = remaining === 0

  return (
    <div className={`bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-3 sm:p-3.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="flex items-center gap-1.5 text-emerald-900">
          {isFree ? (
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <Truck size={16} className="text-emerald-600 flex-shrink-0" />
          )}
          <span>
            {isFree
              ? '¡Felicidades! Tienes Envío Gratis desbloqueado'
              : `Te faltan $${remaining.toLocaleString('es-CL')} para Envío Gratis`}
          </span>
        </span>
        <span className="text-emerald-800 font-bold tabular-nums">{Math.round(progress)}%</span>
      </div>

      <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-[11px] text-emerald-800/80 mt-1.5 flex items-center justify-between font-medium">
        <span>Gran Santiago (comunas de cobertura)</span>
        <span className="tabular-nums">Meta: ${threshold.toLocaleString('es-CL')}</span>
      </div>
    </div>
  )
}
