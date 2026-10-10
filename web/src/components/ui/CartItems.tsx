import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage, getPromoImage } from '../../produce'
import { formatPrice } from '../../utils/cart'

export default function CartItems() {
  const { cart, incrementQuantity, decrementQuantity, removeItem } = useCart()

  return (
    <ul className="space-y-3" aria-label="Productos del pedido">
      {cart.map((item) => {
        const image = item.source === 'promotion' ? getPromoImage(item) : getProduceImage(item)

        return (
          <li
            key={item.cartItemId}
            className="rounded-2xl border border-stone-200/90 p-3.5 flex gap-3.5 bg-stone-50/60 shadow-sm transition hover:bg-stone-50"
          >
            <div
              className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-sm"
              style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
            >
              {image ? (
                <img src={image} alt="" className="w-11 h-11 object-contain drop-shadow" />
              ) : (
                <span aria-hidden="true" className="text-3xl select-none">
                  {item.emoji}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-black text-sm text-stone-900 leading-snug">
                  {item.name}
                </h3>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartItemId)}
                  aria-label={`Eliminar ${item.name}`}
                  className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {item.components && (
                <ul className="text-xs text-stone-500 mt-1.5 space-y-0.5 bg-white p-2 rounded-xl border border-stone-200/60">
                  {item.components.map((component) => (
                    <li key={component.product.id} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        {component.quantity} × {component.product.name} ({UNIT_LABELS[component.product.unit] || component.product.unit})
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-stone-500 text-xs mt-1 tabular-nums font-body">
                {formatPrice(item.price)} · {UNIT_LABELS[item.unit] || item.unit}
              </p>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-200/50">
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => decrementQuantity(item.cartItemId)}
                    aria-label={`Reducir cantidad de ${item.name}`}
                    className="w-7 h-7 rounded-lg bg-stone-50 text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    <Minus size={13} />
                  </button>
                  <span
                    className="w-6 text-center font-heading font-bold text-xs tabular-nums text-stone-900"
                    aria-label={`Cantidad de ${item.name}: ${item.quantity}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementQuantity(item.cartItemId)}
                    disabled={item.quantity >= 99}
                    aria-label={`Aumentar cantidad de ${item.name}`}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <p className="font-heading font-black text-sm text-stone-900 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
