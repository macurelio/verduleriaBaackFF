import { Truck, CheckCircle2 } from 'lucide-react'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { formatPrice } from '../../utils/cart'

export default function FreeShippingBanner() {
  const { isFreeShipping, amountNeeded, progress } = useCartCalculations()
  const { freeShippingOver, deliveryZone } = useSiteConfig()

  return (
    <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4">
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="flex items-center gap-1.5 text-emerald-950 font-heading">
          {isFreeShipping ? (
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <Truck size={16} className="text-emerald-600 flex-shrink-0" />
          )}
          <span className="tabular-nums font-bold">
            {isFreeShipping
              ? '¡Felicidades! Tienes Envío Gratis desbloqueado'
              : `Te faltan ${formatPrice(amountNeeded)} para Envío Gratis`}
          </span>
        </span>
        <span className="text-emerald-800 font-bold tabular-nums font-heading">{Math.round(progress)}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="Progreso hacia despacho gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(progress)}
        aria-valuetext={isFreeShipping ? 'Despacho gratis alcanzado' : `Faltan ${formatPrice(amountNeeded)}`}
        className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden"
      >
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-[11px] text-emerald-800/80 mt-1.5 flex items-center justify-between font-medium font-body">
        <span>{deliveryZone}</span>
        <span className="tabular-nums">Meta: {formatPrice(freeShippingOver)}</span>
      </div>
    </div>
  )
}
