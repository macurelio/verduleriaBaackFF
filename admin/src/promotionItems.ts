import type { Product, ProductUnit } from './api/types'

export interface SelectedProduct {
  productId: string
  quantity: number
}

export const UNIT_LABELS: Record<ProductUnit, string> = {
  kilo: 'kg', unidad: 'unidad', atado: 'atado', bolsa: 'bolsa', docena: 'docena', pack: 'pack',
}

// The current API persists promotion contents as readable strings, not product IDs.
export function formatPromotionItem(product: Product, quantity: number): string {
  return `${quantity} × ${product.name} (${UNIT_LABELS[product.unit]})`
}

export function restorePromotionItems(items: string[], products: Product[]) {
  const selected: SelectedProduct[] = []
  const unmatched: string[] = []
  for (const item of items) {
    const match = /^(\d+) × (.+)$/.exec(item)
    const quantity = match ? Number(match[1]) : 0
    const product = match && products.find((p) => item === formatPromotionItem(p, quantity))
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      unmatched.push(item)
      continue
    }
    const existing = selected.find((entry) => entry.productId === product.id)
    if (existing) {
      // Preserve unusual legacy duplicate lines without exceeding the quantity limit.
      unmatched.push(item)
    } else {
      selected.push({ productId: product.id, quantity })
    }
  }
  return { selected, unmatched }
}
