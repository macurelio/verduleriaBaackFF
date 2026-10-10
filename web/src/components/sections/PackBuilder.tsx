import { useState } from 'react'
import { Plus, Minus, Sparkles } from 'lucide-react'
import { products as fallbackProducts } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { orderLines } from '../../api/orders'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { UNIT_LABELS } from '../../config'
import { formatPrice } from '../../utils/cart'
import { calculatePack } from '../../utils/pack'
import { getProduceImage } from '../../produce'

export default function PackBuilder() {
  const products = useApiResource('products', fetchProducts, fallbackProducts)
  const { cart, addCustomPack } = useCart()
  const { theme } = useTheme()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const available = products.filter(
    (product) =>
      product.unit !== 'pack' &&
      product.category !== 'Packs' &&
      product.source !== 'promotion',
  )

  const selection = available
    .filter((product) => (quantities[product.id] || 0) > 0)
    .map((product) => ({ product, quantity: quantities[product.id] }))

  const amounts = calculatePack(selection)

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-CL')

  const visible = available.filter((product) =>
    normalize(product.name).includes(normalize(search.trim())),
  )

  const change = (id: string, quantity: number) => {
    setMessage('')
    setQuantities((previous) => ({
      ...previous,
      [id]: Math.max(0, Math.min(99, quantity)),
    }))
  }

  const add = () => {
    if (!addCustomPack(selection)) {
      setMessage('Revisa las cantidades: puedes tener hasta 99 unidades de cada producto en el carrito.')
      return
    }
    setQuantities({})
    setMessage('¡Tu pack personalizado se agregó exitosamente al carrito! 🎉')
  }

  return (
    <section id="arma-tu-pack" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6" aria-labelledby="pack-title">
      <div className={`border-b ${theme.border} pb-4`}>
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-heading">
          Canasta a Medida
        </span>
        <h2 id="pack-title" className={`font-heading text-2xl sm:text-3xl font-black ${theme.textMain} tracking-tight`}>
          Arma tu pack personalizado
        </h2>
        <p className={`text-xs sm:text-sm ${theme.textMuted} font-body mt-1`}>
          Elige 4 o más productos distintos para desbloquear hasta un <strong>15% de ahorro automático</strong>.
        </p>
      </div>

      {/* Search Input */}
      <div>
        <label className={`block mb-1.5 text-xs font-heading font-bold ${theme.textMain}`} htmlFor="pack-search">
          Buscar para tu selección
        </label>
        <input
          id="pack-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filtrar por acelga, cebolla, palta, zanahoria..."
          className={`w-full rounded-xl border ${theme.border} ${theme.cardBg} ${theme.textMain} p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition font-body`}
        />
      </div>

      {/* Grid of Produce Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {visible.map((product) => {
          const quantity = quantities[product.id] ?? 0
          const cartUsed = orderLines(cart)
            .filter((item) => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0)
          const remaining = 99 - cartUsed
          const prodImg = getProduceImage(product)

          return (
            <div
              key={product.id}
              className={`rounded-2xl border transition-all p-3.5 flex items-center justify-between gap-3.5 ${
                quantity > 0
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                  : `border ${theme.border} ${theme.cardBg} hover:shadow-md`
              }`}
            >
              {/* Product Visual Thumbnail */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${product.gradientFrom || '#14532d'}, ${product.gradientTo || '#4ade80'})`,
                }}
              >
                {prodImg ? (
                  <img
                    src={prodImg}
                    alt={product.name}
                    className="w-11 h-11 object-contain drop-shadow"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-3xl select-none" aria-hidden="true">
                    {product.emoji || '🥬'}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h3 className={`font-heading font-black text-sm ${theme.textMain} truncate`}>
                  {product.name}
                </h3>
                <p className={`text-xs ${theme.textMuted} font-body mt-0.5 tabular-nums`}>
                  {formatPrice(product.price)} / {UNIT_LABELS[product.unit] || product.unit}
                </p>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 shadow-sm">
                <button
                  type="button"
                  disabled={quantity === 0}
                  aria-label={`Quitar ${product.name} de la selección`}
                  onClick={() => change(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-stone-50 dark:bg-zinc-900 text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                >
                  <Minus size={13} />
                </button>
                <span
                  className={`w-6 text-center font-heading font-bold text-xs tabular-nums ${theme.textMain}`}
                  aria-label={`${quantity} ${UNIT_LABELS[product.unit]}`}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= remaining}
                  aria-label={`Agregar ${product.name} a la selección`}
                  onClick={() => change(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-30 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {visible.length === 0 && (
        <p className={`text-sm ${theme.textMuted} mt-4 text-center py-6`}>
          No encontramos productos con ese nombre.
        </p>
      )}

      {/* Summary Box */}
      <div className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-5 mt-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className={`text-sm font-heading font-black ${theme.textMain}`}>
              {amounts.distinctCount} productos distintos seleccionados ·{' '}
              <span className="text-emerald-600 dark:text-emerald-400 text-lg tabular-nums">
                {formatPrice(amounts.total)}
              </span>
            </p>
            <p className={`text-xs ${theme.textMuted} font-body mt-1`}>
              Desde 4 productos distintos: 10% de descuento. Desde 6: 15%.{' '}
              {amounts.discount > 0 && (
                <strong className="text-emerald-700 dark:text-emerald-300">
                  ¡Ahorras {formatPrice(amounts.discount)}!
                </strong>
              )}{' '}
              El envío se calcula en el carrito.
            </p>
          </div>

          <button
            type="button"
            onClick={add}
            disabled={amounts.distinctCount < 4}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-h-11 px-6 py-3 font-heading font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:bg-stone-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>Agregar pack al carrito</span>
          </button>
        </div>

        {message && (
          <p role="status" className="text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-3">
            {message}
          </p>
        )}
      </div>
    </section>
  )
}
