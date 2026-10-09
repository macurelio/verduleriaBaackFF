import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../hooks/useSiteConfig'

interface MiniCartBarProps {
  onOpenCart: () => void
}

const formatPrice = (n: number) => `$${n.toLocaleString('es-CL')}`

export default function MiniCartBar({ onOpenCart }: MiniCartBarProps) {
  const { shippingFee: SHIPPING_FEE, freeShippingOver: FREE_SHIPPING_OVER } = useSiteConfig()

  const { getCartCount, getCartTotal } = useCart()
  const count = getCartCount()
  const total = getCartTotal()

  if (count === 0) return null

  const shipping = total >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE
  const grandTotal = total + shipping

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-charcoal/95 backdrop-blur shadow-lg">
      <button
        onClick={onOpenCart}
        className="w-full flex items-center justify-between px-4 py-3"
        aria-label="Ver carrito"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart size={18} className="text-sand" />
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-sand text-charcoal text-[9px] font-bold leading-none">
              {count > 9 ? '9+' : count}
            </span>
          </div>
          <span className="text-sand font-heading font-bold text-sm">
            {count} producto{count !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sand font-heading font-black text-sm">{formatPrice(grandTotal)}</span>
          <span className="px-2 py-1 rounded-lg bg-mora text-white text-xs font-heading font-bold">Ver carrito</span>
        </div>
      </button>
    </div>
  )
}
