import { Plus, Minus, Sparkles } from 'lucide-react'
import { promos, type Promo } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { getPromoImage } from '../../produce'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/cart'

interface PromoSectionProps {
  onOpenPackBuilder?: () => void
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

export default function PromoSection({ onOpenPackBuilder }: PromoSectionProps) {
  const promoList = useApiResource('promotions', fetchPromotions, promos)
  const { cart, addToCart, incrementQuantity, decrementQuantity } = useCart()
  const { theme } = useTheme()

  return (
    <section id="packs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Section Header */}
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b ${theme.border} pb-4`}>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-heading">
            Ahorro y Rapidez
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black font-heading tracking-tight ${theme.textMain}`}>
            Packs Armados Listos para Agregar
          </h2>
          <p className={`text-xs sm:text-sm ${theme.textMuted} font-body`}>
            Combos balanceados y canastas con descuento directo sobre el total.
          </p>
        </div>

        {onOpenPackBuilder && (
          <button
            type="button"
            onClick={onOpenPackBuilder}
            className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5 self-start sm:self-auto font-heading transition"
          >
            <Sparkles size={16} className="text-emerald-500" />
            <span>Crear Nuevo Pack Personalizado (-15%)</span>
          </button>
        )}
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {promoList.map((promo) => {
          const cartItem = cart.find((i) => i.id === promo.id)
          const inCartQty = cartItem?.quantity || 0
          const promoImage = getPromoImage(promo)

          return (
            <article
              key={promo.id}
              className={`rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative`}
            >
              <div>
                {/* Pack Image Header */}
                <div
                  className="relative h-44 overflow-hidden flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${promo.gradientFrom}, ${promo.gradientTo})`,
                  }}
                >
                  {promoImage ? (
                    <img
                      src={promoImage}
                      alt={promo.title}
                      className="w-32 h-32 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-7xl drop-shadow-md select-none">{promo.emoji}</span>
                  )}

                  {/* Top Tag Pill */}
                  <div className="absolute top-2.5 left-2.5 bg-stone-950/85 backdrop-blur-md text-amber-300 text-[10px] font-heading font-black px-2.5 py-1 rounded-full border border-stone-700 uppercase tracking-wider">
                    {promo.tag}
                  </div>

                  {/* Savings Pill */}
                  <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-md shadow">
                    Ahorras {formatPrice(promo.savings)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <h3 className={`font-heading font-black text-base ${theme.textMain} leading-snug`}>
                    {promo.title}
                  </h3>
                  <p className={`text-xs ${theme.textMuted} font-body line-clamp-2 leading-relaxed`}>
                    {promo.description}
                  </p>

                  {/* Included Items */}
                  {promo.items && promo.items.length > 0 && (
                    <div className={`pt-2 border-t ${theme.border} space-y-1.5`}>
                      <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-stone-400">
                        Incluye:
                      </div>
                      <ul className={`text-xs ${theme.textMuted} space-y-1 max-h-24 overflow-y-auto pr-1`}>
                        {promo.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Cart Action */}
              <div className={`p-4 sm:p-5 pt-0 border-t ${theme.border} mt-2 flex items-center justify-between`}>
                <div>
                  <div className={`text-xs ${theme.textMuted} line-through tabular-nums font-body`}>
                    {formatPrice(promo.originalPrice)}
                  </div>
                  <div className="text-lg font-heading font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatPrice(promo.promoPrice)}
                  </div>
                </div>

                {inCartQty > 0 ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => decrementQuantity(promo.id)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95 transition"
                      aria-label={`Disminuir ${promo.title}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-heading font-bold text-xs text-emerald-900 dark:text-emerald-200 w-5 text-center tabular-nums">
                      {inCartQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementQuantity(promo.id)}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm active:scale-95 transition"
                      aria-label={`Aumentar ${promo.title}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(promoToProduct(promo))}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Añadir Pack</span>
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
