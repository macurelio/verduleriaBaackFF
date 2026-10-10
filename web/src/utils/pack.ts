import type { Product } from '../types'

export type PackSelection = { product: Product; quantity: number }[]

/** Commercial rule approved: count distinct product IDs, never quantities. */
export function calculatePack(selection: PackSelection) {
  const quantities = new Map<string, { price: number; quantity: number }>()
  for (const { product, quantity } of selection) {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
      !Number.isSafeInteger(product.price) || product.price < 0 || product.source === 'promotion' || product.unit === 'pack' || product.category === 'Packs') continue
    const previous = quantities.get(product.id)
    quantities.set(product.id, { price: product.price, quantity: quantity + (previous?.quantity ?? 0) })
  }
  const distinctCount = quantities.size
  const subtotal = [...quantities.values()].reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountPercent = distinctCount >= 6 ? 15 : distinctCount >= 4 ? 10 : 0
  const discount = Math.floor(subtotal * discountPercent / 100)
  return { distinctCount, subtotal, discountPercent, discount, total: subtotal - discount }
}
