import { useCart } from '../context/CartContext'
import { useSiteConfig } from './useSiteConfig'
import { calculateCart } from '../utils/cart'

export function useCartCalculations() {
  const { cart, quote } = useCart()
  const { shippingFee, freeShippingOver } = useSiteConfig()
  const local = calculateCart(cart, shippingFee, freeShippingOver)
  return quote ? { ...local, ...quote, isFreeShipping: quote.shipping === 0, amountNeeded: Math.max(0, freeShippingOver - quote.subtotal), progress: freeShippingOver > 0 ? Math.min(100, quote.subtotal / freeShippingOver * 100) : 100 } : local
}
