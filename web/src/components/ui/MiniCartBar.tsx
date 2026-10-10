import { ShoppingBag, Sparkles } from 'lucide-react'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { formatPrice } from '../../utils/cart'

interface MiniCartBarProps {
  onOpenCart: () => void
  onOpenPackBuilder?: () => void
}

export default function MiniCartBar({ onOpenCart, onOpenPackBuilder }: MiniCartBarProps) {
  const { itemCount, total } = useCartCalculations()

  if (itemCount === 0 && !onOpenPackBuilder) return null

  return (
    <aside
      aria-label="Acciones rápidas de compra"
      className="md:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-lg mx-auto bg-stone-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-stone-800/80 p-2 sm:p-2.5 flex items-center justify-between gap-2 pointer-events-auto">
        {onOpenPackBuilder && (
          <button
            type="button"
            onClick={onOpenPackBuilder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-heading font-bold transition active:scale-95"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Pack (-15%)</span>
          </button>
        )}

        {itemCount > 0 ? (
          <button
            type="button"
            onClick={onOpenCart}
            className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs shadow-md transition active:scale-95"
            aria-label={`Ver carrito con ${itemCount} productos, total estimado ${formatPrice(total)}`}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag size={17} />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <span>Ver Carrito</span>
            </div>
            <span className="tabular-nums font-black">{formatPrice(total)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenCart}
            className="flex-1 text-center py-2 text-xs font-semibold text-stone-400"
          >
            Tu canasta está vacía
          </button>
        )}
      </div>
    </aside>
  )
}
