import { Pencil } from 'lucide-react'
import { products as fallbackProducts } from '../../data/products'
import { suggestedPacks, type SuggestedPack, type SuggestedPackLine } from '../../data/suggestedPacks'
import { fetchProducts } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useTheme } from '../../context/ThemeContext'
import { getProduceImage, getSuggestedPackImage } from '../../produce'
import { formatPrice } from '../../utils/cart'
import { calculatePack } from '../../utils/pack'
import { UNIT_LABELS } from '../../config'

interface SuggestedPacksSectionProps {
  onCustomize: (pack: SuggestedPack, lines: SuggestedPackLine[]) => void
}

export default function SuggestedPacksSection({ onCustomize }: SuggestedPacksSectionProps) {
  const products = useApiResource('products', fetchProducts, fallbackProducts)
  const { theme } = useTheme()

  const productById = new Map(products.map((product) => [product.id, product]))

  const packs = suggestedPacks.flatMap((pack) => {
    const resolved = pack.lines.flatMap((line) => {
      const product = productById.get(line.productId)
      return product && product.unit !== 'pack' && product.category !== 'Packs'
        ? [{ product, quantity: line.quantity }]
        : []
    })
    const amounts = calculatePack(resolved)
    if (amounts.distinctCount < 4) return []
    return [{ pack, resolved, amounts }]
  })

  if (packs.length === 0) return null

  return (
    <section
      id="packs"
      aria-labelledby="packs-sugeridos-title"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
    >
      <div className={`border-b ${theme.border} pb-4`}>
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-heading">
          Punto de partida
        </span>
        <h2
          id="packs-sugeridos-title"
          className={`text-2xl sm:text-3xl font-black font-heading tracking-tight ${theme.textMain}`}
        >
          Packs sugeridos
        </h2>
        <p className={`text-xs sm:text-sm ${theme.textMuted} font-body`}>
          Elige uno como base y ajústalo a tu gusto: cambia cantidades, quita o suma productos antes de agregarlo al carrito.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packs.map(({ pack, resolved, amounts }) => {
          const image = getSuggestedPackImage(pack.id)
          return (
            <article
              key={pack.id}
              className={`rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group`}
            >
              <div
                className="relative h-44 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${pack.gradientFrom}, ${pack.gradientTo})` }}
              >
                {image ? (
                  <img
                    src={image}
                    alt={pack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-7xl select-none">
                    {pack.emoji}
                  </span>
                )}
                <div className="absolute top-2.5 left-2.5 bg-stone-950/85 backdrop-blur-md text-amber-300 text-[10px] font-heading font-black px-2.5 py-1 rounded-full border border-stone-700 uppercase tracking-wider">
                  {pack.tag}
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-md shadow">
                  -{amounts.discountPercent}% pack
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3 flex-1">
                <h3 className={`font-heading font-black text-base ${theme.textMain} leading-snug`}>
                  {pack.title}
                </h3>
                <p className={`text-xs ${theme.textMuted} font-body leading-relaxed`}>{pack.description}</p>
                <ul className={`pt-2 border-t ${theme.border} text-xs ${theme.textMuted} space-y-1`}>
                  {resolved.map(({ product, quantity }) => {
                    const thumb = getProduceImage(product)
                    return (
                      <li key={product.id} className="flex items-center gap-2 truncate">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-5 h-5 rounded object-cover shrink-0" loading="lazy" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <span className="truncate">
                          {quantity} × {product.name} ({UNIT_LABELS[product.unit] || product.unit})
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className={`p-4 sm:p-5 pt-3 border-t ${theme.border} flex items-center justify-between gap-3`}>
                <div>
                  <div className={`text-xs ${theme.textMuted} line-through tabular-nums font-body`}>
                    {formatPrice(amounts.subtotal)}
                  </div>
                  <div className="text-lg font-heading font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatPrice(amounts.total)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onCustomize(
                      pack,
                      resolved.map(({ product, quantity }) => ({ productId: product.id, quantity })),
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  <span>Personalizar</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
