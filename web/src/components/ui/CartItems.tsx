import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage, getPromoImage } from '../../produce'
import { formatPrice } from '../../utils/cart'

export default function CartItems() {
  const { cart, incrementQuantity, decrementQuantity, removeItem } = useCart()
  return <ul className="space-y-3" aria-label="Productos del pedido">
    {cart.map(item => {
      const image = item.source === 'promotion' ? getPromoImage(item) : getProduceImage(item)
      return <li key={item.cartItemId} className="rounded-2xl border border-border p-3 flex gap-3 bg-canvas">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}>
          {image ? <img src={image} alt="" className="w-12 h-12 object-contain" /> : <span aria-hidden="true" className="text-3xl">{item.emoji}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm leading-snug">{item.name}</h3>
          {item.components && <ul className="text-xs text-muted mt-2">{item.components.map(component => <li key={component.product.id}>{component.quantity} × {component.product.name} · {UNIT_LABELS[component.product.unit]}</li>)}</ul>}
          <p className="text-muted text-xs mt-1 tabular-nums">{formatPrice(item.price)} · {UNIT_LABELS[item.unit]}</p>
          <div className="flex items-center flex-wrap gap-1 mt-2">
            <button type="button" onClick={() => decrementQuantity(item.cartItemId)} aria-label={`Reducir cantidad de ${item.name}`} className="quantity-button"><Minus size={16} /></button>
            <span className="w-7 text-center font-bold tabular-nums" aria-label={`Cantidad de ${item.name}: ${item.quantity}`}>{item.quantity}</span>
            <button type="button" onClick={() => incrementQuantity(item.cartItemId)} disabled={item.quantity >= 99} aria-label={`Aumentar cantidad de ${item.name}`} className="quantity-button"><Plus size={16} /></button>
            <button type="button" onClick={() => removeItem(item.cartItemId)} aria-label={`Eliminar ${item.name}`} className="quantity-button text-error ml-auto"><Trash2 size={16} /></button>
          </div>
          <p className="font-bold tabular-nums text-right mt-1">{formatPrice(item.price * item.quantity)}</p>
        </div>
      </li>
    })}
  </ul>
}
