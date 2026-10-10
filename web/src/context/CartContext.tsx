import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product, CartItem, CartContextType } from '../types'
import { fetchProducts, fetchPromotions } from '../api/catalog'
import { useApiResource } from '../api/useApiResource'
import type { Promo } from '../data/promos'

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
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const products = useApiResource<Product[] | null>('products', fetchProducts, null)
  const promotions = useApiResource<Promo[] | null>('promotions', fetchPromotions, null)

  useEffect(() => {
    if (!products && !promotions) return
    const productById = new Map(products?.map((product) => [product.id, product]))
    const promoById = new Map(promotions?.map((promo) => [promo.id, promo]))
    setCart((previous) => previous.flatMap((item) => {
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
      const existing = prev.find((i) => i.cartItemId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === product.id ? { ...i, ...product, quantity: Math.min(99, i.quantity + quantity) } : i,
        )
      }
      return [...prev, { ...product, cartItemId: product.id, quantity: Math.min(99, quantity) } as CartItem]
    })
  }

  const incrementQuantity = (cartItemId: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i,
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
