import { ShoppingCart } from 'lucide-react'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { formatPrice } from '../../utils/cart'

export default function MiniCartBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { itemCount, total } = useCartCalculations()
  if (itemCount === 0) return null
  return <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface shadow-lg pb-[env(safe-area-inset-bottom)]">
    <button type="button" onClick={onOpenCart} className="w-full min-h-16 flex justify-between items-center gap-3 px-4 py-3 text-ink" aria-label={`Ver carrito con ${itemCount} productos, total estimado ${formatPrice(total)}`}>
      <span className="flex items-center gap-2 text-sm"><ShoppingCart size={20} aria-hidden="true" /><span className="tabular-nums">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span></span>
      <span className="text-right"><span className="block text-xs text-muted">Total estimado con despacho</span><span className="font-bold text-mora-dark tabular-nums">{formatPrice(total)} · Ver pedido</span></span>
    </button>
  </div>
}
