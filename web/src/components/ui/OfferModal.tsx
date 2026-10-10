import { useState } from 'react'
import { X, Sparkles, Tag, Plus, Minus, Check, MessageCircle } from 'lucide-react'
import { promos, type Promo } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useCart } from '../../context/CartContext'
import { getPromoImage } from '../../produce'
import { formatPrice } from '../../utils/cart'
import type { Product } from '../../types'
import Dialog from './Dialog'

interface OfferModalProps {
  open: boolean
  onClose: () => void
}

const promoToProduct = (promo: Promo): Product => ({
  id: promo.id,
  name: promo.title,
  category: 'Packs',
  description: promo.description,
  price: promo.promoPrice,
  unit: 'pack',
  emoji: promo.emoji,
  badge: promo.badge,
  gradientFrom: promo.gradientFrom,
  gradientTo: promo.gradientTo,
  source: 'promotion',
})

export default function OfferModal({ open, onClose }: OfferModalProps) {
  const offers = useApiResource('promotions', fetchPromotions, promos)
  const { cart, addToCart, incrementQuantity, decrementQuantity, setCouponCode } = useCart()
  const { waLink } = useSiteConfig()
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const couponCode = 'FRESCO10'

  const handleApplyCoupon = () => {
    navigator.clipboard?.writeText(couponCode)
    setCouponCode(couponCode)
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  return (
    <Dialog open={open} onClose={onClose} titleId="offer-modal-title">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/60 dark:to-teal-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="offer-modal-title" className="font-heading font-black text-lg sm:text-xl text-stone-900 dark:text-white">
                  Packs en Oferta Especial
                </h2>
                <span className="text-[10px] font-heading font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Semanal
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-body mt-0.5">
                Combos armados con descuento directo de hasta un 20% + 10% adicional con cupón.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de ofertas"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl hover:bg-white/80 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Coupon Callout Banner inside Dialog */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Tag size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-heading font-bold text-stone-900 dark:text-zinc-100">
                  Cupón extra 10% de descuento en el pedido:
                </p>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                  Código <strong className="text-emerald-700 dark:text-emerald-300 font-mono font-black">{couponCode}</strong> aplicable en el carrito.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold transition active:scale-95 shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
              {copiedCoupon ? (
                <>
                  <Check size={13} />
                  <span>¡Aplicado al carrito!</span>
                </>
              ) : (
                <span>Aplicar Cupón</span>
              )}
            </button>
          </div>

          {/* List of Special Promo Packs */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-stone-400">
              Packs Disponibles para Agregar:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((promo) => {
                const cartItem = cart.find((i) => i.id === promo.id)
                const inCartQty = cartItem?.quantity || 0
                const promoImg = getPromoImage(promo)

                return (
                  <div
                    key={promo.id}
                    className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/50 p-4 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Promo Image & Tag */}
                      <div
                        className="relative h-32 rounded-xl overflow-hidden flex items-center justify-center mb-3 shadow-inner"
                        style={{
                          background: `linear-gradient(135deg, ${promo.gradientFrom}, ${promo.gradientTo})`,
                        }}
                      >
                        {promoImg ? (
                          <img
                            src={promoImg}
                            alt={promo.title}
                            className="w-24 h-24 object-contain drop-shadow"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-5xl">{promo.emoji}</span>
                        )}
                        <span className="absolute top-2 left-2 bg-stone-950/80 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          {promo.tag}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                          Ahorras {formatPrice(promo.savings)}
                        </span>
                      </div>

                      <h4 className="font-heading font-black text-sm text-stone-900 dark:text-zinc-100">
                        {promo.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {promo.description}
                      </p>

                      {promo.items && (
                        <ul className="text-[11px] text-stone-600 dark:text-zinc-300 space-y-0.5 mt-2 max-h-16 overflow-y-auto">
                          {promo.items.slice(0, 4).map((it, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 truncate">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span className="truncate">{it}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-stone-200/60 dark:border-zinc-700/60 mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 line-through tabular-nums block">
                          {formatPrice(promo.originalPrice)}
                        </span>
                        <span className="text-base font-heading font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatPrice(promo.promoPrice)}
                        </span>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(promo.id)}
                            className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-200 flex items-center justify-center font-bold text-xs"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-heading font-bold text-xs text-emerald-900 dark:text-emerald-200 w-5 text-center">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQuantity(promo.id)}
                            className="w-6 h-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-xs"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(promoToProduct(promo))}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition active:scale-95 shadow-sm flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Añadir</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={waLink('¡Hola! Tengo consultas sobre los packs en oferta especial 🥬')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-600 dark:text-zinc-400 hover:text-emerald-600 flex items-center gap-1.5 font-medium"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            <span>Consultar disponibilidad por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-zinc-800 hover:bg-stone-800 text-white font-heading font-bold text-xs uppercase tracking-wider transition active:scale-95"
          >
            Listo / Ver Carrito
          </button>
        </div>
      </div>
    </Dialog>
  )
}
