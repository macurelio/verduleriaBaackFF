import { useEffect, useRef, useState } from 'react'
import { X, Minus, Plus, Check, MapPin, Sparkles, Leaf } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import { formatPrice } from '../../utils/cart'
import type { Product } from '../../types'
import Dialog from './Dialog'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, cart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setQty(1)
    setAdded(false)
    return () => clearTimeout(timer.current)
  }, [product?.id])

  if (!product) return null

  const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0
  const remaining = 99 - inCart
  const selected = Math.min(qty, remaining)

  const handleAdd = () => {
    if (!product || selected === 0 || added) return
    addToCart(product, selected)
    setAdded(true)
    timer.current = setTimeout(() => {
      setAdded(false)
      setQty(1)
      onClose()
    }, 1200)
  }

  const image = getProduceImage(product)

  return (
    <Dialog open={Boolean(product)} onClose={onClose} titleId="quick-view-title">
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          className="absolute top-3 right-3 z-20 p-2 text-white bg-stone-950/60 hover:bg-stone-950 rounded-full transition"
        >
          <X size={16} />
        </button>

        {/* Product Image Header with harvest pill */}
        <div
          className="relative h-60 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})`,
          }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="max-h-48 w-full object-contain p-4 drop-shadow-md select-none"
            />
          ) : (
            <span className="text-8xl select-none" aria-hidden="true">
              {product.emoji}
            </span>
          )}

          {product.harvest && (
            <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md text-stone-100 text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-1.5 shadow">
              <MapPin size={13} className="text-emerald-400" />
              <span>{product.harvest}</span>
            </div>
          )}

          {product.badge && (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-heading font-black uppercase px-2.5 py-1 rounded-full shadow">
              {product.badge}
            </div>
          )}
        </div>

        {/* Product Details & Nutrition */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span className="uppercase font-bold tracking-wider text-emerald-700">
                {product.category}
              </span>
              {product.unitDetail && (
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                  {product.unitDetail}
                </span>
              )}
            </div>
            <h2 id="quick-view-title" className="font-heading font-black text-2xl text-stone-900 mt-0.5">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-body leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Nutritional & Culinary highlights */}
          {(product.nutrition || product.recipeTip) && (
            <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs">
              {product.nutrition && (
                <div>
                  <div className="flex items-center gap-1.5 text-stone-800 font-bold mb-0.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Aporte nutricional:</span>
                  </div>
                  <p className="text-stone-600 pl-5 leading-normal">{product.nutrition}</p>
                </div>
              )}

              {product.recipeTip && (
                <div className="pt-1.5 border-t border-stone-200/50">
                  <div className="flex items-center gap-1.5 text-stone-800 font-bold mb-0.5">
                    <Leaf size={14} className="text-amber-500" />
                    <span>Idea de receta:</span>
                  </div>
                  <p className="text-stone-600 pl-5 leading-normal">{product.recipeTip}</p>
                </div>
              )}
            </div>
          )}

          {/* Price & Quantity Stepper */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-heading font-black text-stone-900 tabular-nums">
                {formatPrice(product.price)}
              </div>
              <div className="text-xs text-stone-400 font-medium">
                por {UNIT_LABELS[product.unit] || product.unit}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={selected <= 1 || added}
                  aria-label={`Reducir cantidad de ${product.name}`}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-200 disabled:opacity-50 flex items-center justify-center font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center font-heading font-bold text-sm tabular-nums text-stone-800">
                  {selected}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                  disabled={selected >= remaining || added}
                  aria-label={`Aumentar cantidad de ${product.name}`}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-200 disabled:opacity-50 flex items-center justify-center font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={selected === 0 || added}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {added ? (
                  <>
                    <Check size={16} />
                    <span>Agregado</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Sumar al Carrito</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
