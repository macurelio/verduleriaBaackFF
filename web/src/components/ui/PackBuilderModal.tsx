import { useState, useMemo } from 'react'
import { X, Package, Plus, Minus, Sparkles, Search } from 'lucide-react'
import { products as fallbackProducts } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { orderLines } from '../../api/orders'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import { formatPrice } from '../../utils/cart'
import { calculatePack } from '../../utils/pack'
import Dialog from './Dialog'

interface PackBuilderModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
}

export default function PackBuilderModal({ open, onClose, onSuccess }: PackBuilderModalProps) {
  const products = useApiResource('products', fetchProducts, fallbackProducts)
  const { cart, addCustomPack } = useCart()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [packTitle, setPackTitle] = useState('')
  const [search, setSearch] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const available = useMemo(
    () =>
      products.filter(
        (product) =>
          product.unit !== 'pack' &&
          product.category !== 'Packs' &&
          product.source !== 'promotion',
      ),
    [products],
  )

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-CL')

  const visible = useMemo(
    () =>
      available.filter((product) =>
        normalize(product.name).includes(normalize(search.trim())),
      ),
    [available, search],
  )

  const selection = useMemo(
    () =>
      available
        .filter((product) => (quantities[product.id] || 0) > 0)
        .map((product) => ({ product, quantity: quantities[product.id] })),
    [available, quantities],
  )

  const amounts = useMemo(() => calculatePack(selection), [selection])

  const updateQuantity = (id: string, delta: number) => {
    setErrorMsg('')
    const current = quantities[id] || 0
    const next = Math.max(0, Math.min(99, current + delta))
    setQuantities((prev) => {
      const copy = { ...prev }
      if (next === 0) {
        delete copy[id]
      } else {
        copy[id] = next
      }
      return copy
    })
  }

  const handleSavePack = () => {
    if (amounts.distinctCount < 4) {
      setErrorMsg('Debes seleccionar al menos 4 productos distintos para armar tu pack.')
      return
    }

    const ok = addCustomPack(selection)
    if (!ok) {
      setErrorMsg('Revisa las cantidades: puedes tener hasta 99 unidades de cada producto en el carrito.')
      return
    }

    setQuantities({})
    setPackTitle('')
    if (onSuccess) {
      onSuccess(`¡Pack personalizado (${amounts.discountPercent}% DCTO) agregado al carrito!`)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} titleId="pack-builder-title">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow">
              <Package size={24} />
            </div>
            <div>
              <h2 id="pack-builder-title" className="font-heading font-black text-lg text-stone-900">
                Arma tu Propio Pack Personalizado
              </h2>
              <p className="text-xs text-stone-500 font-body">
                Elige 4 o más verduras/frutas distintas y recibe un{' '}
                <strong className="text-emerald-700">10% a 15% de descuento automático</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar creador de packs"
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Custom pack title input */}
          <div>
            <label className="text-xs font-heading font-bold text-stone-700 block mb-1">
              Nombre para tu Pack (opcional):
            </label>
            <input
              type="text"
              value={packTitle}
              onChange={(e) => setPackTitle(e.target.value)}
              placeholder="Ej: Canasta Semanal, Pack Ensaladas Verdes..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-body"
            />
          </div>

          {/* Search produce */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nombre..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-body"
            />
          </div>

          {/* Selection status chip */}
          <div className="flex items-center justify-between text-xs font-heading font-bold text-stone-600 pt-1">
            <span>Selecciona tus productos:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                amounts.distinctCount >= 6
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : amounts.distinctCount >= 4
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {amounts.distinctCount} de 4 mínimos{' '}
              {amounts.distinctCount >= 6
                ? '(15% DCTO activado 🎉)'
                : amounts.distinctCount >= 4
                ? '(10% DCTO activado 👍)'
                : `(te faltan ${4 - amounts.distinctCount} para 10% DCTO)`}
            </span>
          </div>

          {/* Produce Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {visible.map((prod) => {
              const count = quantities[prod.id] || 0
              const cartUsed = orderLines(cart)
                .filter((line) => line.productId === prod.id)
                .reduce((sum, line) => sum + line.quantity, 0)
              const maxAllowed = 99 - cartUsed
              const prodImg = getProduceImage(prod)

              return (
                <div
                  key={prod.id}
                  className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    count > 0
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${prod.gradientFrom}, ${prod.gradientTo})`,
                    }}
                  >
                    {prodImg ? (
                      <img src={prodImg} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-2xl">{prod.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-xs text-stone-900 truncate">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-body">
                      {formatPrice(prod.price)} / {UNIT_LABELS[prod.unit] || prod.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(prod.id, -1)}
                      disabled={count === 0}
                      className="w-6 h-6 rounded flex items-center justify-center text-xs text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums text-stone-900">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(prod.id, 1)}
                      disabled={count >= maxAllowed}
                      className="w-6 h-6 rounded flex items-center justify-center text-xs text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 space-y-0.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span>
                Precio normal:{' '}
                <span className="line-through text-stone-400 tabular-nums">
                  {formatPrice(amounts.subtotal)}
                </span>
              </span>
              {amounts.discountPercent > 0 && (
                <span className="bg-amber-400 text-stone-950 font-heading font-black px-2 py-0.5 rounded text-[10px]">
                  -{amounts.discountPercent}% PACK
                </span>
              )}
            </div>
            <div className="text-base font-heading font-black text-emerald-800 tabular-nums">
              Total Pack: {formatPrice(amounts.total)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSavePack}
              disabled={amounts.distinctCount < 4}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Guardar y Agregar Pack</span>
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
