import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product, CartItem, CartContextType } from '../types'
import { fetchProducts } from '../api/catalog'
import { useApiResource } from '../api/useApiResource'
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
    ).filter(item => item.source === 'custom-pack' && Array.isArray(item.components) && item.components.length >= 4 && item.components.every(component =>
      component.product && typeof component.product.id === 'string' && component.product.unit !== 'pack' && !component.product.source &&
      Number.isSafeInteger(component.product.price) && component.product.price >= 0 && Number.isSafeInteger(component.quantity) && component.quantity >= 1 && component.quantity <= 99)).filter(item => {
      const amounts = calculatePack(item.components ?? [])
      return amounts.eligible && amounts.distinctCount === item.components?.length
    })
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

  useEffect(() => {
    if (!products) return
    const productById = new Map(products.map((product) => [product.id, product]))
    setCart((previous) => previous.flatMap((item) => {
      const components = item.components?.flatMap(component => {
        const product = productById.get(component.product.id)
        return product && product.unit !== 'pack' && product.category !== 'Packs' ? [{ product, quantity: component.quantity }] : []
      }) ?? []
      if (components.length !== item.components?.length || !calculatePack(components).eligible) return []
      return [{ ...item, components, price: calculatePack(components).total }]
    }))
  }, [products])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* Storage may be disabled. */ }
  }, [cart])

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
    if (!amounts.eligible || amounts.distinctCount !== components.length) return false
    const id = `pack-${crypto.randomUUID()}`
    const item: CartItem = { id, cartItemId: id, name: 'Pack personalizado', description: components.map(component => component.product.name).join(', '), category: 'Packs', unit: 'pack', emoji: '🧺', badge: `${amounts.discountPercent} %`, gradientFrom: '#2F7D32', gradientTo: '#D9F2BD', price: amounts.total, quantity: 1, source: 'custom-pack', components }
    if (!canAdd(item, 1, cart)) return false
    setCart(previous => canAdd(item, 1, previous) ? [...previous, item] : previous)
    return true
  }

  const getCartTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
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
