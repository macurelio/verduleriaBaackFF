import { useCart } from '../context/CartContext'
import { useSiteConfig } from './useSiteConfig'
import { calculateCart } from '../utils/cart'

export function useCartCalculations() {
  const { cart } = useCart()
  const { shippingFee, freeShippingOver } = useSiteConfig()
  return calculateCart(cart, shippingFee, freeShippingOver)
}
