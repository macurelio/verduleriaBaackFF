import type { CartItem } from '../types'

export const formatPrice = (value: number) => `$${value.toLocaleString('es-CL')}`

/** Previsualización local; la API determina los importes del pedido registrado. */
export function calculateCart(cart: Pick<CartItem, 'price' | 'quantity'>[], shippingFee: number, threshold: number) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const isFreeShipping = itemCount > 0 && subtotal >= threshold
  const shipping = itemCount === 0 || isFreeShipping ? 0 : shippingFee
  return {
    subtotal, itemCount, shipping, total: subtotal + shipping, isFreeShipping,
    amountNeeded: Math.max(0, threshold - subtotal),
    progress: threshold > 0 ? Math.min(100, Math.max(0, subtotal / threshold * 100)) : 100,
  }
}
