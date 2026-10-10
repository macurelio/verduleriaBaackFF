import { api } from './client'
import type { CartItem } from '../types'

export interface OrderItemInput {
  productId: string
  quantity: number
  packId?: string
}

export interface CreateOrderInput {
  customerName: string
  phone: string
  address: string
  comuna: string
  /** Fecha ISO `YYYY-MM-DD` */
  deliveryDate: string
  deliveryWindow: string
  paymentMethod: string
  notes?: string
  items: OrderItemInput[]
  couponCode?: string
}

export interface CreateOrderResponse extends OrderQuote {
  id: string
  code: string
  status: string
  subtotal: number
  shipping: number
  total: number
  whatsappUrl: string
  createdAt: string
}

/** Crea el pedido en el backend y devuelve el link wa.me generado en servidor. */
export function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/orders', {
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    comuna: input.comuna,
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    paymentMethod: input.paymentMethod,
    notes: input.notes || null,
    items: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity, ...(i.packId ? { packId: i.packId } : {}) })),
    couponCode: input.couponCode || null,
  })
}

export interface OrderQuote {
  grossSubtotal: number
  packDiscount: number
  couponDiscount: number
  couponCode: string | null
  subtotal: number
  shipping: number
  total: number
}

export function orderLines(cart: CartItem[]): OrderItemInput[] {
  return cart.flatMap(item => item.source === 'custom-pack' && item.components
    ? item.components.map(({ product, quantity }) => ({ productId: product.id, quantity: quantity * item.quantity, packId: item.cartItemId }))
    : [{ productId: item.id, quantity: item.quantity }])
}

export function quoteOrder(cart: CartItem[], couponCode: string): Promise<OrderQuote> {
  return api.post<OrderQuote>('/orders/quote', { items: orderLines(cart), couponCode: couponCode || null })
}
