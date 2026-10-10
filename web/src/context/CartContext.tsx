import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product, CartItem, CartContextType } from '../types'
import { fetchProducts, fetchPromotions } from '../api/catalog'
import { useApiResource } from '../api/useApiResource'
import type { Promo } from '../data/promos'
import { calculatePack } from '../utils/pack'
import { quoteOrder, orderLines, type OrderQuote } from '../api/orders'

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = 'mv_cart_v1'

function loadCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item): item is CartItem =>
      item && typeof item.id === 'string' && item.cartItemId === item.id &&
      typeof item.name === 'string' && typeof item.description === 'string' &&
      typeof item.category === 'string' && typeof item.emoji === 'string' &&
      typeof item.gradientFrom === 'string' && typeof item.gradientTo === 'string' &&
      ['kilo', 'unidad', 'atado', 'bolsa', 'docena', 'pack'].includes(item.unit) &&
      Number.isSafeInteger(item.price) && item.price >= 0 &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99,
    ).filter(item => item.source !== 'custom-pack' || (Array.isArray(item.components) && item.components.length >= 4 && item.components.every(component =>
      component.product && typeof component.product.id === 'string' && component.product.unit !== 'pack' && !component.product.source &&
      Number.isSafeInteger(component.product.price) && component.product.price >= 0 && Number.isSafeInteger(component.quantity) && component.quantity >= 1 && component.quantity <= 99)))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [couponCode, setCouponCode] = useState('')
  const [quoteAttempt, setQuoteAttempt] = useState(0)
  const retryQuote = () => { setQuoted(null); setQuoteError(null); setQuoteAttempt(previous => previous + 1) }
  const [quoted, setQuoted] = useState<{ key: string; data: OrderQuote } | null>(null)
  const [quoteErrorState, setQuoteError] = useState<{ key: string; message: string } | null>(null)
  const needsQuote = cart.some(item => item.source === 'custom-pack') || !!couponCode
  const quoteKey = JSON.stringify({ cart, couponCode })
  const quote = quoted?.key === quoteKey ? quoted.data : null
  const quoteError = quoteErrorState?.key === quoteKey ? quoteErrorState.message : ''
  const quotePending = needsQuote && cart.length > 0 && !quote && !quoteError
  useEffect(() => {
    if (!needsQuote || !cart.length) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      quoteOrder(cart, couponCode).then(data => {
        if (![data.grossSubtotal, data.packDiscount, data.couponDiscount, data.subtotal, data.shipping, data.total].every(value => Number.isSafeInteger(value) && value >= 0) || data.total !== data.subtotal + data.shipping) throw new Error('No se pudo validar el total del pedido.')
        if (!cancelled) setQuoted({ key: quoteKey, data })
      }).catch(error => { if (!cancelled) setQuoteError({ key: quoteKey, message: error instanceof Error ? error.message : 'No se pudo cotizar el pedido.' }) })
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [cart, couponCode, needsQuote, quoteKey, quoteAttempt])
  const products = useApiResource<Product[] | null>('products', fetchProducts, null)
  const promotions = useApiResource<Promo[] | null>('promotions', fetchPromotions, null)

  useEffect(() => {
    if (!products && !promotions) return
    const productById = new Map(products?.map((product) => [product.id, product]))
    const promoById = new Map(promotions?.map((promo) => [promo.id, promo]))
    setCart((previous) => previous.flatMap((item) => {
      if (item.source === 'custom-pack') {
        if (!products) return [item]
        const components = item.components?.flatMap(component => {
          const product = productById.get(component.product.id)
          return product && product.unit !== 'pack' && product.category !== 'Packs' ? [{ product, quantity: component.quantity }] : []
        }) ?? []
        if (components.length !== item.components?.length || calculatePack(components).distinctCount < 4) return []
        return [{ ...item, components, price: calculatePack(components).total }]
      }
      const isPromotion = item.source === 'promotion' || item.id.startsWith('promo-') || item.id.startsWith('combo-')
      if (isPromotion) {
        if (!promotions) return [item]
        const promo = promoById.get(item.id)
        return promo ? [{ ...item, name: promo.title, price: promo.promoPrice, description: promo.description, source: 'promotion' as const }] : []
      }
      if (!products) return [item]
      const current = productById.get(item.id)
      return current ? [{ ...item, ...current }] : []
    }))
  }, [products, promotions])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* Storage may be disabled. */ }
  }, [cart])

  const addToCart = (product: Product, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    setCart((prev) => {
      const already = orderLines(prev).filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0)
      const addedQuantity = Math.min(quantity, 99 - already)
      if (addedQuantity <= 0) return prev
      const existing = prev.find((i) => i.cartItemId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === product.id ? { ...i, ...product, quantity: i.quantity + addedQuantity } : i,
        )
      }
      return [...prev, { ...product, cartItemId: product.id, quantity: addedQuantity } as CartItem]
    })
  }

  const incrementQuantity = (cartItemId: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId && canAdd(i, 1, prev) ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i,
      ),
    )

  const decrementQuantity = (cartItemId: string) =>
    setCart((prev) =>
      prev.flatMap((i) => i.cartItemId !== cartItemId ? [i]
        : i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : []),
    )

  const removeItem = (cartItemId: string) =>
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId))

  const getCartCount = () => cart.reduce((sum, i) => sum + i.quantity, 0)

  const canAdd = (item: CartItem, delta: number, current: CartItem[]) => {
    const additions = item.components?.map(component => ({ id: component.product.id, quantity: component.quantity * delta })) ?? [{ id: item.id, quantity: delta }]
    const lines = orderLines(current)
    return additions.every(addition => addition.quantity + lines.filter(line => line.productId === addition.id).reduce((sum, line) => sum + line.quantity, 0) <= 99)
  }
  const addCustomPack = (components: { product: Product; quantity: number }[]) => {
    const amounts = calculatePack(components)
    if (amounts.distinctCount < 4 || amounts.distinctCount !== components.length) return false
    const id = `pack-${crypto.randomUUID()}`
    const item: CartItem = { id, cartItemId: id, name: 'Pack personalizado', description: components.map(component => component.product.name).join(', '), category: 'Packs', unit: 'pack', emoji: '🧺', badge: `${amounts.discountPercent} %`, gradientFrom: '#2F7D32', gradientTo: '#D9F2BD', price: amounts.total, quantity: 1, source: 'custom-pack', components }
    if (!canAdd(item, 1, cart)) return false
    setCart(previous => canAdd(item, 1, previous) ? [...previous, item] : previous)
    return true
  }

  const addSelection = (items: { product: Product; quantity: number }[]) => {
    const ids = new Set(items.map(({ product }) => product.id))
    if (!items.length || ids.size !== items.length || items.some(({ product, quantity }) =>
      !Number.isSafeInteger(quantity) || quantity < 1 ||
      quantity + (cart.find(item => item.id === product.id)?.quantity ?? 0) > 99)) return false
    setCart(previous => {
      if (items.some(({ product, quantity }) => quantity + (previous.find(item => item.id === product.id)?.quantity ?? 0) > 99)) return previous
      const next = [...previous]
      for (const { product, quantity } of items) {
        const index = next.findIndex(item => item.id === product.id)
        if (index >= 0) next[index] = { ...next[index], ...product, quantity: next[index].quantity + quantity }
        else next.push({ ...product, cartItemId: product.id, quantity })
      }
      return next
    })
    return true
  }

  const getCartTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addSelection,
        addCustomPack, couponCode, setCouponCode, quote, quotePending, quoteError, retryQuote,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
