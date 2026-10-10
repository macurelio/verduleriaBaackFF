import { useState } from 'react'
import { products as fallbackProducts } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { orderLines } from '../../api/orders'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { formatPrice } from '../../utils/cart'
import { calculatePack } from '../../utils/pack'

export default function PackBuilder() {
  const products = useApiResource('products', fetchProducts, fallbackProducts)
  const { cart, addCustomPack } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const available = products.filter(product => product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion')
  const selection = available.filter(product => quantities[product.id] > 0).map(product => ({ product, quantity: quantities[product.id] }))
  const amounts = calculatePack(selection)
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CL')
  const visible = available.filter(product => normalize(product.name).includes(normalize(search.trim())))
  const change = (id: string, quantity: number) => {
    setMessage('')
    setQuantities(previous => ({ ...previous, [id]: Math.max(0, Math.min(99, quantity)) }))
  }
  const add = () => {
    if (!addCustomPack(selection)) {
      setMessage('Revisa las cantidades: puedes tener hasta 99 unidades de cada producto en el carrito.')
      return
    }
    setQuantities({})
    setMessage('Tu pack personalizado se agregó al carrito.')
  }
  return <section id="arma-tu-pack" className="bg-warm py-12 px-4" aria-labelledby="pack-title">
    <div className="max-w-6xl mx-auto">
      <h2 id="pack-title" className="font-heading text-3xl text-ink font-bold">Arma tu pack personalizado</h2>
      <p className="text-muted mt-2">Elige productos y cantidades según su unidad de venta.</p>
      <label className="field-label mt-6" htmlFor="pack-search">Buscar para tu selección</label>
      <input id="pack-search" type="search" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-xl border border-border p-3 bg-surface text-ink" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {visible.map(product => {
          const quantity = quantities[product.id] ?? 0
          const remaining = 99 - orderLines(cart).filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0)
          return <div key={product.id} className="bg-surface border border-border rounded-xl p-4">
            <p className="font-semibold text-ink"><span aria-hidden="true">{product.emoji} </span>{product.name}</p>
            <p className="text-muted text-sm">{formatPrice(product.price)} / {UNIT_LABELS[product.unit]}</p>
            <div className="flex items-center gap-3 mt-3">
              <button type="button" className="quantity-button" disabled={quantity === 0} aria-label={`Quitar ${product.name} de la selección`} onClick={() => change(product.id, quantity - 1)}>−</button>
              <span className="tabular-nums text-ink" aria-label={`${quantity} ${UNIT_LABELS[product.unit]}`}>{quantity}</span>
              <button type="button" className="quantity-button" disabled={quantity >= remaining} aria-label={`Agregar ${product.name} a la selección`} onClick={() => change(product.id, quantity + 1)}>+</button>
            </div>
          </div>
        })}
      </div>
      {visible.length === 0 && <p className="text-muted mt-4">No encontramos productos con ese nombre.</p>}
      <div className="bg-surface rounded-xl border border-border p-5 mt-6">
        <p className="text-ink">{amounts.distinctCount} productos distintos · <strong>{formatPrice(amounts.total)}</strong></p>
        <p className="text-muted text-sm mt-2">Desde 4 productos distintos: 10 % de descuento. Desde 6: 15 %. {amounts.discount > 0 && `Ahorras ${formatPrice(amounts.discount)}.`} El envío se calcula en el carrito.</p>
        <button type="button" onClick={add} disabled={amounts.distinctCount < 4} className="bg-mora text-white rounded-xl min-h-11 px-5 py-3 mt-4 disabled:opacity-50">Agregar pack al carrito</button>
        <p role="status" className="text-ink mt-2">{message}</p>
      </div>
    </div>
  </section>
}
