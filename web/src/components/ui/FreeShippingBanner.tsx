import { Truck } from 'lucide-react'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { formatPrice } from '../../utils/cart'

export default function FreeShippingBanner() {
  const { isFreeShipping, amountNeeded, progress } = useCartCalculations()
  const { freeShippingOver, deliveryZone } = useSiteConfig()
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex gap-3 items-start">
        <Truck size={20} className="text-mora mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink tabular-nums" role="status">
            {isFreeShipping ? 'Tu pedido tiene despacho gratis' : `Te faltan ${formatPrice(amountNeeded)} para despacho gratis`}
          </p>
          <p className="mt-1 text-xs text-muted">Desde {formatPrice(freeShippingOver)} · {deliveryZone}</p>
        </div>
      </div>
      <div role="progressbar" aria-label="Progreso hacia despacho gratis" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress)} aria-valuetext={isFreeShipping ? 'Despacho gratis alcanzado' : `Faltan ${formatPrice(amountNeeded)}`} className="mt-3 h-2 rounded-full overflow-hidden bg-cream-border">
        <div className="h-full bg-mora rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
