import { useEffect, useRef, useState } from 'react'
import { X, Minus, Plus, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import { formatPrice } from '../../utils/cart'
import type { Product } from '../../types'
import Dialog from './Dialog'

export default function QuickViewModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addToCart, cart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    setQty(1); setAdded(false)
    return () => clearTimeout(timer.current)
  }, [product?.id])
  const inCart = cart.find(item => item.id === product?.id)?.quantity ?? 0
  const remaining = 99 - inCart
  const selected = Math.min(qty, remaining)
  const handleAdd = () => {
    if (!product || selected === 0 || added) return
    addToCart(product, selected)
    setAdded(true)
    timer.current = setTimeout(() => { setAdded(false); setQty(1) }, 1600)
  }
  const image = getProduceImage(product)
  return <Dialog open={Boolean(product)} onClose={onClose} titleId="quick-view-title">
    {product && <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border"><span className="text-muted text-sm">Vista rápida</span><button type="button" onClick={onClose} aria-label="Cerrar vista rápida" className="quantity-button"><X size={20} /></button></div>
      <div className="grid sm:grid-cols-2">
        <div className="min-h-40 max-h-60 sm:max-h-none flex items-center justify-center p-5" style={{ background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})` }}>{image ? <img src={image} alt="" className="max-h-44 sm:max-h-72 w-full object-contain" /> : <span className="text-8xl" aria-hidden="true">{product.emoji}</span>}</div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted">{product.category}</p>
          <h2 id="quick-view-title" className="font-heading font-bold text-2xl">{product.name}</h2>
          <p className="font-bold text-xl text-mora-dark tabular-nums">{formatPrice(product.price)} <span className="text-sm text-muted font-normal">{UNIT_LABELS[product.unit]}</span></p>
          {product.badge && <span className="inline-block bg-cream-warm text-mora-dark text-xs px-3 py-1 rounded-full">{product.badge}</span>}
          <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          <p className="text-xs text-muted">Disponibilidad y entrega sujetas a confirmación de la tienda.</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={selected <= 1 || added} aria-label={`Reducir cantidad de ${product.name}`} className="quantity-button"><Minus size={16} /></button>
            <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">{selected}</span>
            <button type="button" onClick={() => setQty(q => Math.min(remaining, q + 1))} disabled={selected >= remaining || added} aria-label={`Aumentar cantidad de ${product.name}`} className="quantity-button"><Plus size={16} /></button>
          </div>
          <button type="button" onClick={handleAdd} disabled={selected === 0 || added} className="w-full min-h-11 rounded-xl bg-mora text-white hover:bg-mora-dark px-3 py-3 font-bold text-sm disabled:opacity-60 tabular-nums">{added ? <span className="flex justify-center items-center gap-2"><Check size={16} /> Agregado</span> : selected === 0 ? 'Límite de 99 alcanzado' : `Agregar · ${formatPrice(product.price * selected)}`}</button>
          <p className="sr-only" role="status">{added ? `${product.name} agregado al carrito` : ''}</p>
        </div>
      </div>
    </>}
  </Dialog>
}
