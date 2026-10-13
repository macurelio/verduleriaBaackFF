import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Plus, Minus, Search, Sparkles, X, Trash2 } from 'lucide-react'
import { products as fallbackProducts } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { orderLines } from '../../api/orders'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { UNIT_LABELS, PACK_MIN_EXCLUSIVE } from '../../config'
import { formatPrice } from '../../utils/cart'
import { calculatePack } from '../../utils/pack'
import { getProduceImage } from '../../produce'
import CategoryChips from '../ui/CategoryChips'
import FreeShippingProgressBar from '../ui/FreeShippingProgressBar'

interface PackBuilderProps {
  quantities: Record<string, number>
  onQuantitiesChange: Dispatch<SetStateAction<Record<string, number>>>
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onAdded?: (message: string) => void
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CL')

export default function PackBuilder({
  quantities,
  onQuantitiesChange,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAdded,
}: PackBuilderProps) {
  const products = useApiResource('products', fetchProducts, fallbackProducts)
  const { cart, addCustomPack, getCartTotal } = useCart()
  const { theme } = useTheme()
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const available = useMemo(
    () =>
      products.filter(
        (product) =>
          product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion',
      ),
    [products],
  )

  const selection = useMemo(
    () =>
      available
        .filter((product) => (quantities[product.id] || 0) > 0)
        .map((product) => ({ product, quantity: quantities[product.id] })),
    [available, quantities],
  )

  const amounts = useMemo(() => calculatePack(selection), [selection])
  const unitsCount = selection.reduce((sum, item) => sum + item.quantity, 0)

  const query = normalize(searchQuery.trim())
  const visible = available.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch =
      !query || normalize(`${product.name} ${product.description} ${product.category}`).includes(query)
    return matchesCategory && matchesSearch
  })

  const change = (id: string, quantity: number) => {
    setMessage(null)
    onQuantitiesChange((previous) => {
      const next = { ...previous }
      const clamped = Math.max(0, Math.min(99, quantity))
      if (clamped === 0) delete next[id]
      else next[id] = clamped
      return next
    })
  }

  const clear = () => {
    setMessage(null)
    onQuantitiesChange({})
  }

  const add = () => {
    if (amounts.distinctCount < 4) {
      setMessage({ type: 'error', text: 'Elige al menos 4 productos distintos para armar tu pack.' })
      return
    }
    if (!amounts.eligible) {
      setMessage({ type: 'error', text: `Tu pack debe superar ${formatPrice(PACK_MIN_EXCLUSIVE)} después del descuento, sin envío.` })
      return
    }
    if (!addCustomPack(selection)) {
      setMessage({
        type: 'error',
        text: 'Revisa las cantidades: puedes tener hasta 99 unidades de cada producto en el carrito.',
      })
      return
    }
    onQuantitiesChange({})
    const text = `¡Tu pack (${amounts.discountPercent}% DCTO) se agregó al carrito!`
    setMessage({ type: 'ok', text })
    onAdded?.(text)
  }

  const missing = Math.max(0, 4 - amounts.distinctCount)
  const progress = Math.min(100, (amounts.distinctCount / 6) * 100)

  return (
    <section
      id="arma-tu-pack"
      aria-labelledby="pack-title"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6 scroll-mt-24"
    >
      <FreeShippingProgressBar currentSubtotal={getCartTotal()} threshold={20000} />

      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b ${theme.border} pb-4`}>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-heading">
            Tu canasta a medida
          </span>
          <h2 id="pack-title" className={`font-heading text-2xl sm:text-3xl font-black ${theme.textMain} tracking-tight`}>
            Arma tu pack de verduras
          </h2>
          <p className={`text-xs sm:text-sm ${theme.textMuted} font-body mt-1`}>
            Elige <strong>4 o más productos distintos</strong>: 10% de descuento desde 4 y{' '}
            <strong>15% desde 6</strong>. Cada pack debe superar {formatPrice(PACK_MIN_EXCLUSIVE)} después del descuento, sin envío.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="pack-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar acelga, palta, zanahoria..."
            aria-label="Buscar productos para tu pack"
            className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border ${theme.border} ${theme.cardBg} ${theme.textMain} focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-body`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <CategoryChips selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />

      <div className={`flex items-center justify-between text-xs ${theme.textMuted} px-1`}>
        <span>
          Mostrando <strong className={theme.textMain}>{visible.length}</strong> producto
          {visible.length === 1 ? '' : 's'}
        </span>
        {(searchQuery || selectedCategory) && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('')
              onSelectCategory(null)
            }}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {visible.map((product) => {
          const quantity = quantities[product.id] ?? 0
          const cartUsed = orderLines(cart)
            .filter((item) => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0)
          const remaining = 99 - cartUsed
          const image = getProduceImage(product)
          const unitLabel = UNIT_LABELS[product.unit] || product.unit

          return (
            <article
              key={product.id}
              className={`rounded-2xl border overflow-hidden transition-all flex flex-col ${
                quantity > 0
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : `${theme.border} hover:shadow-lg`
              } ${theme.cardBg}`}
            >
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${product.gradientFrom || '#14532d'}, ${product.gradientTo || '#4ade80'})`,
                }}
              >
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-5xl select-none" aria-hidden="true">
                    {product.emoji || '🥬'}
                  </span>
                )}
                {quantity > 0 && (
                  <span className="absolute top-2 right-2 min-w-7 h-7 px-2 rounded-full bg-emerald-600 text-white text-xs font-heading font-black flex items-center justify-center shadow tabular-nums">
                    ×{quantity}
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 flex flex-col gap-3 flex-1 justify-between">
                <div className="min-w-0">
                  <h3 className={`font-heading font-black text-sm ${theme.textMain} truncate`}>{product.name}</h3>
                  <p className={`text-xs ${theme.textMuted} font-body mt-0.5 tabular-nums`}>
                    {formatPrice(product.price)} / {unitLabel}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5">
                  <button
                    type="button"
                    disabled={quantity === 0}
                    aria-label={`Quitar ${product.name} del pack`}
                    onClick={() => change(product.id, quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center active:scale-95 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className={`flex-1 text-center font-heading font-bold text-xs tabular-nums ${theme.textMain}`}
                    aria-label={`${quantity} ${unitLabel}`}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= remaining}
                    aria-label={`Agregar ${product.name} al pack`}
                    onClick={() => change(product.id, quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-30 flex items-center justify-center active:scale-95 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {visible.length === 0 && (
        <p className={`text-sm ${theme.textMuted} text-center py-8`}>
          No encontramos productos con esos filtros. Prueba con otro término.
        </p>
      )}

      {/* Resumen del pack: queda visible mientras se arma */}
      <div
        className={`sticky bottom-24 md:bottom-4 z-30 rounded-2xl border ${theme.border} ${theme.cardBg} p-4 sm:p-5 shadow-2xl space-y-3`}
        aria-label="Resumen de tu pack"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className={`text-sm font-heading font-black ${theme.textMain}`}>
              {amounts.distinctCount} producto{amounts.distinctCount === 1 ? '' : 's'} distinto
              {amounts.distinctCount === 1 ? '' : 's'} · {unitsCount} unidad{unitsCount === 1 ? '' : 'es'}
            </p>
            <p className={`text-xs ${theme.textMuted} font-body`}>
              {missing > 0
                ? `Te falta${missing === 1 ? '' : 'n'} ${missing} producto${missing === 1 ? '' : 's'} para desbloquear 10% de descuento.`
                : amounts.distinctCount < 6
                  ? `10% de descuento activo. Con ${6 - amounts.distinctCount} más llegas al 15%.`
                  : '¡15% de descuento activo!'}{' '}
              {amounts.total <= PACK_MIN_EXCLUSIVE
                ? `Agrega productos o cantidades: te faltan ${formatPrice(PACK_MIN_EXCLUSIVE + 1 - amounts.total)} para alcanzar el mínimo del pack.`
                : 'Tu pack cumple el mínimo. El envío se calcula en el carrito.'}
            </p>
            <div className="h-2 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden max-w-sm" aria-hidden="true">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="text-right">
              {amounts.discount > 0 && (
                <div className={`text-xs ${theme.textMuted} line-through tabular-nums`}>
                  {formatPrice(amounts.subtotal)}
                </div>
              )}
              <div className="text-lg sm:text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatPrice(amounts.total)}
              </div>
              {amounts.discount > 0 && (
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Ahorras {formatPrice(amounts.discount)}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={clear}
              disabled={selection.length === 0}
              aria-label="Vaciar selección"
              className={`p-2.5 rounded-xl border ${theme.border} ${theme.textMuted} hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 transition`}
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              onClick={add}
              disabled={!amounts.eligible}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11 px-5 py-3 font-heading font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:bg-stone-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Agregar pack al carrito</span>
            </button>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className={`text-xs font-bold ${
              message.type === 'ok' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  )
}
