import { useState } from 'react'
import { Minus, Plus, Eye, MapPin } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import QuickViewModal from './QuickViewModal'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import type { ProductCardProps } from '../../types'
import { formatPrice } from '../../utils/cart'

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, incrementQuantity, decrementQuantity, cart } = useCart()
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const cartItem = cart.find((i) => i.cartItemId === product.id)
  const qty = cartItem ? cartItem.quantity : 0

  const handleIncrement = () => {
    if (cartItem) {
      incrementQuantity(cartItem.cartItemId)
    } else {
      addToCart(product)
    }
  }

  const handleDecrement = () => {
    if (!cartItem) return
    decrementQuantity(cartItem.cartItemId)
  }

  const produceImage = getProduceImage(product)

  return (
    <>
      <article
        className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
        aria-label={product.name}
      >
        <div>
          {/* Image + Quick View trigger + Harvest pill */}
          <div
            className="relative h-44 overflow-hidden flex items-center justify-center select-none"
            style={{
              background: `linear-gradient(135deg, ${product.gradientFrom} 0%, ${product.gradientTo} 100%)`,
            }}
          >
            {produceImage ? (
              <img
                src={produceImage}
                alt={product.name}
                className="w-32 h-32 object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md select-none pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <span className="text-7xl drop-shadow-md select-none" aria-hidden="true">
                {product.emoji}
              </span>
            )}

            {/* Top-left Badge */}
            {product.badge && (
              <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-heading font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                {product.badge}
              </div>
            )}

            {/* Quick View Button (hover desktop, always accessible via tap/click) */}
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={`Vista rápida de ${product.name}`}
              title="Vista rápida"
            >
              <Eye size={15} />
            </button>

            {/* Harvest Location Origin */}
            {product.harvest && (
              <div className="absolute bottom-2.5 left-2.5 bg-stone-950/80 backdrop-blur-md text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                <MapPin size={11} className="text-emerald-400" />
                <span className="truncate max-w-[150px]">{product.harvest}</span>
              </div>
            )}
          </div>

          {/* Content info */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
              <span className="truncate">{product.category}</span>
              {product.unitDetail ? (
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  {product.unitDetail}
                </span>
              ) : (
                <span className="capitalize">{UNIT_LABELS[product.unit] || product.unit}</span>
              )}
            </div>

            <h3
              onClick={() => setQuickViewOpen(true)}
              className="font-heading font-black text-base text-stone-900 leading-snug cursor-pointer hover:text-emerald-700 transition"
            >
              {product.name}
            </h3>

            <p className="text-[11px] text-stone-500 font-body line-clamp-1 leading-relaxed">
              {product.nutrition || product.description}
            </p>
          </div>
        </div>

        {/* Stepper / Add button Footer */}
        <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
          <div>
            <div className="text-lg font-heading font-black text-stone-900 tabular-nums">
              {formatPrice(product.price)}
            </div>
            <div className="text-[10px] text-stone-400 uppercase font-semibold">
              por {UNIT_LABELS[product.unit] || product.unit}
            </div>
          </div>

          {qty > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95 transition"
                aria-label={`Disminuir ${product.name}`}
              >
                <Minus size={13} />
              </button>
              <span className="font-heading font-bold text-xs text-emerald-900 w-5 text-center tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95 transition"
                aria-label={`Aumentar ${product.name}`}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIncrement}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-sm"
              aria-label={`Añadir ${product.name} al carrito`}
            >
              <Plus size={14} />
              <span>Añadir</span>
            </button>
          )}
        </div>
      </article>

      <QuickViewModal product={quickViewOpen ? product : null} onClose={() => setQuickViewOpen(false)} />
    </>
  )
}
